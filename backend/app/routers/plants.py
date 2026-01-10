from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.plant import Plant
from app.schemas.plant import PlantCreate, PlantUpdate, PlantResponse, PlantListResponse
from app.utils.auth import get_current_user
from app.services.photo_storage import photo_storage
from app.services.pet_toxicity import pet_toxicity_service

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
    Auto-detects pet toxicity if species is provided and pet_friendly is not set.
    """
    plant_dict = plant_data.model_dump()

    # Auto-detect pet toxicity if species is provided and pet_friendly is not set
    if plant_dict.get('species') and plant_dict.get('pet_friendly') is None:
        toxicity_info = await pet_toxicity_service.get_toxicity(
            species=plant_dict.get('species'),
            common_name=plant_dict.get('identified_common_name')
        )
        if toxicity_info:
            plant_dict['pet_friendly'] = toxicity_info['pet_friendly']

    new_plant = Plant(
        user_id=current_user.id,
        **plant_dict
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


@router.post("/upload-photo", status_code=status.HTTP_201_CREATED)
async def upload_plant_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a photo for a plant.
    Returns the URL of the uploaded photo.
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )

    # Use plant_id=0 as a temporary placeholder since this is for new plants
    photo_url = await photo_storage.save_photo(file, plant_id=0)

    return {"photo_url": photo_url}
