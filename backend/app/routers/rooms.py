"""Room photo management endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.room import RoomPhoto
from app.schemas.room import (
    RoomPhotoResponse,
    RoomPhotoListResponse,
    RoomPhotoUpdate
)
from app.utils.auth import get_current_user
from app.services.photo_storage import photo_storage
from app.services.room_analysis import room_analysis
import os

router = APIRouter()


def verify_room_ownership(room_id: int, user_id: int, db: Session) -> RoomPhoto:
    """Verify that the room photo belongs to the current user."""
    room = db.query(RoomPhoto).filter(RoomPhoto.id == room_id, RoomPhoto.user_id == user_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    return room


@router.post("/rooms", response_model=RoomPhotoResponse, status_code=status.HTTP_201_CREATED)
async def create_room(
    file: UploadFile = File(...),
    room_name: str = Form(...),
    user_tagged_lighting: Optional[str] = Form(None),
    user_notes: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a room photo and analyze lighting.

    This endpoint:
    1. Validates the uploaded file is an image
    2. Saves the photo
    3. Analyzes lighting using image processing
    4. Stores room data with analysis results

    Args:
        file: Room photo file
        room_name: Name of the room (e.g., "Living Room")
        user_tagged_lighting: User's manual lighting assessment (optional)
        user_notes: User's notes about the room (optional)
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )

    # Save photo (using room_id of 0 temporarily, we'll update later)
    photo_url = await photo_storage.save_photo(file, plant_id=0)

    # Create room record
    room = RoomPhoto(
        user_id=current_user.id,
        room_name=room_name,
        photo_url=photo_url,
        user_tagged_lighting=user_tagged_lighting,
        user_notes=user_notes,
        ai_analysis_complete=False
    )

    db.add(room)
    db.commit()
    db.refresh(room)

    # Analyze lighting in background (async)
    full_path = os.path.join(photo_storage.upload_dir, photo_url.lstrip('/photos/'))
    try:
        analysis_result = await room_analysis.analyze_lighting(full_path)

        if analysis_result.get('lighting_score') is not None:
            room.ai_lighting_score = analysis_result['lighting_score']
            room.ai_lighting_category = analysis_result['category']
            room.ai_analysis_complete = True
            db.commit()
            db.refresh(room)
    except Exception as e:
        print(f"Room lighting analysis failed: {e}")
        # Continue without analysis, user can retry later

    return RoomPhotoResponse.model_validate(room)


@router.get("/rooms", response_model=RoomPhotoListResponse)
async def get_rooms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all rooms for the current user.

    Returns list of room photos with analysis data.
    """
    rooms = db.query(RoomPhoto).filter(RoomPhoto.user_id == current_user.id).order_by(RoomPhoto.created_at.desc()).all()

    return RoomPhotoListResponse(
        rooms=[RoomPhotoResponse.model_validate(room) for room in rooms],
        total=len(rooms)
    )


@router.get("/rooms/{room_id}", response_model=RoomPhotoResponse)
async def get_room(
    room_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific room by ID.

    Returns room details including analysis results.
    """
    room = verify_room_ownership(room_id, current_user.id, db)
    return RoomPhotoResponse.model_validate(room)


@router.put("/rooms/{room_id}", response_model=RoomPhotoResponse)
async def update_room(
    room_id: int,
    room_update: RoomPhotoUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update room information.

    Allows updating room name, manual lighting tag, and notes.
    Does not update the photo or AI analysis.
    """
    room = verify_room_ownership(room_id, current_user.id, db)

    # Update fields if provided
    if room_update.room_name is not None:
        room.room_name = room_update.room_name
    if room_update.user_tagged_lighting is not None:
        room.user_tagged_lighting = room_update.user_tagged_lighting
    if room_update.user_notes is not None:
        room.user_notes = room_update.user_notes

    db.commit()
    db.refresh(room)

    return RoomPhotoResponse.model_validate(room)


@router.post("/rooms/{room_id}/reanalyze", response_model=RoomPhotoResponse)
async def reanalyze_room(
    room_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Re-run lighting analysis on a room photo.

    Useful if the initial analysis failed or user wants updated results.
    """
    room = verify_room_ownership(room_id, current_user.id, db)

    # Get photo path
    full_path = os.path.join(photo_storage.upload_dir, room.photo_url.lstrip('/photos/'))

    try:
        analysis_result = await room_analysis.analyze_lighting(full_path)

        if analysis_result.get('lighting_score') is not None:
            room.ai_lighting_score = analysis_result['lighting_score']
            room.ai_lighting_category = analysis_result['category']
            room.ai_analysis_complete = True
            db.commit()
            db.refresh(room)
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Analysis failed: {analysis_result.get('error', 'Unknown error')}"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Room lighting analysis failed: {str(e)}"
        )

    return RoomPhotoResponse.model_validate(room)


@router.delete("/rooms/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(
    room_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a room photo.

    Also deletes the associated photo file from storage.
    """
    room = verify_room_ownership(room_id, current_user.id, db)

    # Delete photo file
    photo_storage.delete_photo(room.photo_url)

    # Delete database record
    db.delete(room)
    db.commit()

    return None
