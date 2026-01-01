from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.plant import Plant
from app.schemas.plant import PlantCreate, PlantUpdate, PlantResponse, PlantListResponse
from app.utils.auth import get_current_user

router = APIRouter()


@router.get("", response_model=PlantListResponse)
async def get_plants(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all plants for the current user.
    """
    plants = db.query(Plant).filter(Plant.user_id == current_user.id).all()

    return {
        "plants": plants,
        "total": len(plants)
    }


@router.get("/{plant_id}", response_model=PlantResponse)
async def get_plant(
    plant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific plant by ID.
    Only returns if the plant belongs to the current user.
    """
    plant = db.query(Plant).filter(
        Plant.id == plant_id,
        Plant.user_id == current_user.id
    ).first()

    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )

    return plant


@router.post("", response_model=PlantResponse, status_code=status.HTTP_201_CREATED)
async def create_plant(
    plant_data: PlantCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new plant for the current user.
    """
    new_plant = Plant(
        user_id=current_user.id,
        **plant_data.model_dump()
    )

    db.add(new_plant)
    db.commit()
    db.refresh(new_plant)

    return new_plant


@router.put("/{plant_id}", response_model=PlantResponse)
async def update_plant(
    plant_id: int,
    plant_data: PlantUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a plant.
    Only allows updating plants that belong to the current user.
    """
    plant = db.query(Plant).filter(
        Plant.id == plant_id,
        Plant.user_id == current_user.id
    ).first()

    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )

    # Update only provided fields
    update_data = plant_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(plant, key, value)

    db.commit()
    db.refresh(plant)

    return plant


@router.delete("/{plant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plant(
    plant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a plant.
    Only allows deleting plants that belong to the current user.
    """
    plant = db.query(Plant).filter(
        Plant.id == plant_id,
        Plant.user_id == current_user.id
    ).first()

    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plant not found"
        )

    db.delete(plant)
    db.commit()

    return None
