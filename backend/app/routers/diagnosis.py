"""Plant diagnosis endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.plant import Plant
from app.models.photo import PlantPhoto, DiagnosisSolution
from app.schemas.diagnosis import (
    DiagnosisResponse,
    DiagnosisListResponse,
    PlantPhotoResponse,
    DiagnosisSolutionResponse,
)
from app.utils.auth import get_current_user
from app.services.photo_storage import photo_storage
from app.services.google_search import google_search

router = APIRouter()


def verify_plant_ownership(plant_id: int, user_id: int, db: Session) -> Plant:
    """Verify that the plant belongs to the current user."""
    plant = db.query(Plant).filter(Plant.id == plant_id, Plant.user_id == user_id).first()
    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )
    return plant


import re

def validate_description(description: str) -> None:
    """Validate that the description contains meaningful text."""
    trimmed = description.strip()

    if not trimmed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description is required"
        )

    if len(trimmed) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description must be at least 10 characters"
        )

    # Count letters
    letter_count = len(re.findall(r'[a-zA-Z]', trimmed))
    if letter_count < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description must contain meaningful words, not just numbers or symbols"
        )

    # Letters should make up at least 50% of non-space characters
    non_space_chars = len(trimmed.replace(' ', ''))
    if non_space_chars > 0 and letter_count / non_space_chars < 0.5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please use a natural language description"
        )

    # Check for at least 2 word-like sequences
    words = re.findall(r'[a-zA-Z]{2,}', trimmed)
    if len(words) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please describe the problem in a sentence or phrase"
        )


@router.post("/plants/{plant_id}/diagnose", response_model=DiagnosisResponse, status_code=status.HTTP_201_CREATED)
async def create_text_diagnosis(
    plant_id: int,
    description: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get diagnosis solutions using only a text description and the plant's existing photo.

    This endpoint:
    1. Uses the plant's existing photo
    2. Searches for solutions using Google Custom Search
    3. Stores the diagnosis and solutions in the database
    4. Returns the diagnosis results
    """
    # Validate description
    validate_description(description)

    # Verify plant ownership
    plant = verify_plant_ownership(plant_id, current_user.id, db)

    # Use plant's existing photo URL
    photo_url = plant.photo_url or ""

    # Create photo record (reusing the plant's photo URL)
    photo = PlantPhoto(
        plant_id=plant_id,
        photo_url=photo_url,
        description=description
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)

    # Search for solutions
    search_query = f"{plant.name} {description} plant problem solution"
    search_results = await google_search.search_plant_problem(search_query)

    # Save solutions to database
    solutions = []
    for result in search_results:
        solution = DiagnosisSolution(
            photo_id=photo.id,
            title=result['title'],
            snippet=result.get('snippet'),
            url=result['url'],
            rank=result['rank']
        )
        db.add(solution)
        solutions.append(solution)

    db.commit()

    # Refresh all solutions to get their IDs
    for solution in solutions:
        db.refresh(solution)

    return {
        "photo": photo,
        "solutions": solutions,
        "total_solutions": len(solutions)
    }


@router.post("/plants/{plant_id}/diagnosis", response_model=DiagnosisResponse, status_code=status.HTTP_201_CREATED)
async def create_diagnosis(
    plant_id: int,
    file: UploadFile = File(...),
    description: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a photo and get diagnosis solutions for a plant problem.

    This endpoint:
    1. Saves the uploaded photo
    2. Searches for solutions using Google Custom Search
    3. Stores the photo and solutions in the database
    4. Returns the diagnosis results
    """
    # Validate description
    validate_description(description)

    # Verify plant ownership
    plant = verify_plant_ownership(plant_id, current_user.id, db)

    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )

    # Save the photo
    photo_url = await photo_storage.save_photo(file, plant_id)

    # Create photo record
    photo = PlantPhoto(
        plant_id=plant_id,
        photo_url=photo_url,
        description=description
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)

    # Search for solutions
    search_query = f"{plant.name} {description} plant problem solution"
    search_results = await google_search.search_plant_problem(search_query)

    # Save solutions to database
    solutions = []
    for result in search_results:
        solution = DiagnosisSolution(
            photo_id=photo.id,
            title=result['title'],
            snippet=result.get('snippet'),
            url=result['url'],
            rank=result['rank']
        )
        db.add(solution)
        solutions.append(solution)

    db.commit()

    # Refresh all solutions to get their IDs
    for solution in solutions:
        db.refresh(solution)

    return {
        "photo": photo,
        "solutions": solutions,
        "total_solutions": len(solutions)
    }


@router.get("/plants/{plant_id}/diagnosis", response_model=DiagnosisListResponse)
async def get_plant_diagnoses(
    plant_id: int,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all diagnosis photos for a plant."""
    # Verify plant ownership
    verify_plant_ownership(plant_id, current_user.id, db)

    photos = db.query(PlantPhoto)\
        .filter(PlantPhoto.plant_id == plant_id)\
        .order_by(PlantPhoto.created_at.desc())\
        .limit(limit)\
        .all()

    return {
        "diagnoses": photos,
        "total": len(photos)
    }


@router.get("/diagnosis/{photo_id}", response_model=DiagnosisResponse)
async def get_diagnosis(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific diagnosis with its solutions."""
    # Get photo
    photo = db.query(PlantPhoto).filter(PlantPhoto.id == photo_id).first()
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Diagnosis not found"
        )

    # Verify plant ownership
    verify_plant_ownership(photo.plant_id, current_user.id, db)

    # Get solutions
    solutions = db.query(DiagnosisSolution)\
        .filter(DiagnosisSolution.photo_id == photo_id)\
        .order_by(DiagnosisSolution.rank)\
        .all()

    return {
        "photo": photo,
        "solutions": solutions,
        "total_solutions": len(solutions)
    }


@router.delete("/diagnosis/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_diagnosis(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a diagnosis and its photo."""
    # Get photo
    photo = db.query(PlantPhoto).filter(PlantPhoto.id == photo_id).first()
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Diagnosis not found"
        )

    # Verify plant ownership
    verify_plant_ownership(photo.plant_id, current_user.id, db)

    # Delete the photo file
    photo_storage.delete_photo(photo.photo_url)

    # Delete from database (solutions will be cascade deleted)
    db.delete(photo)
    db.commit()

    return None
