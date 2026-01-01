"""Watering schedule and history endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.plant import Plant
from app.models.watering import WateringSchedule, WateringHistory
from app.schemas.watering import (
    WateringScheduleCreate,
    WateringScheduleUpdate,
    WateringScheduleResponse,
    WateringHistoryCreate,
    WateringHistoryResponse,
    WateringHistoryListResponse,
)
from app.utils.auth import get_current_user

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


def calculate_next_watering(last_watered: date, frequency_days: int) -> date:
    """Calculate the next watering date based on last watered date and frequency."""
    return last_watered + timedelta(days=frequency_days)


@router.post("/plants/{plant_id}/watering/schedule", response_model=WateringScheduleResponse, status_code=status.HTTP_201_CREATED)
async def create_watering_schedule(
    plant_id: int,
    schedule_data: WateringScheduleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a watering schedule for a plant."""
    # Verify plant ownership
    verify_plant_ownership(plant_id, current_user.id, db)

    # Check if schedule already exists
    existing = db.query(WateringSchedule).filter(WateringSchedule.plant_id == plant_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Watering schedule already exists for this plant. Use PUT to update."
        )

    # Create new schedule
    schedule = WateringSchedule(
        plant_id=plant_id,
        frequency_days=schedule_data.frequency_days
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


@router.get("/plants/{plant_id}/watering/schedule", response_model=WateringScheduleResponse)
async def get_watering_schedule(
    plant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get watering schedule for a plant."""
    # Verify plant ownership
    verify_plant_ownership(plant_id, current_user.id, db)

    schedule = db.query(WateringSchedule).filter(WateringSchedule.plant_id == plant_id).first()
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watering schedule not found for this plant"
        )
    return schedule


@router.put("/plants/{plant_id}/watering/schedule", response_model=WateringScheduleResponse)
async def update_watering_schedule(
    plant_id: int,
    schedule_data: WateringScheduleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update watering schedule for a plant."""
    # Verify plant ownership
    verify_plant_ownership(plant_id, current_user.id, db)

    schedule = db.query(WateringSchedule).filter(WateringSchedule.plant_id == plant_id).first()
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watering schedule not found for this plant"
        )

    # Update fields
    if schedule_data.frequency_days is not None:
        schedule.frequency_days = schedule_data.frequency_days
        # Recalculate next watering if last_watered exists
        if schedule.last_watered:
            schedule.next_watering = calculate_next_watering(schedule.last_watered, schedule.frequency_days)

    db.commit()
    db.refresh(schedule)
    return schedule


@router.delete("/plants/{plant_id}/watering/schedule", status_code=status.HTTP_204_NO_CONTENT)
async def delete_watering_schedule(
    plant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete watering schedule for a plant."""
    # Verify plant ownership
    verify_plant_ownership(plant_id, current_user.id, db)

    schedule = db.query(WateringSchedule).filter(WateringSchedule.plant_id == plant_id).first()
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watering schedule not found for this plant"
        )

    db.delete(schedule)
    db.commit()
    return None


@router.post("/plants/{plant_id}/watering/water", response_model=WateringHistoryResponse, status_code=status.HTTP_201_CREATED)
async def record_watering(
    plant_id: int,
    watering_data: WateringHistoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record a watering event and update the schedule."""
    # Verify plant ownership
    verify_plant_ownership(plant_id, current_user.id, db)

    # Use provided time or current time
    watered_at = watering_data.watered_at or datetime.utcnow()

    # Create history entry
    history = WateringHistory(
        plant_id=plant_id,
        watered_at=watered_at,
        notes=watering_data.notes
    )
    db.add(history)

    # Update schedule if it exists
    schedule = db.query(WateringSchedule).filter(WateringSchedule.plant_id == plant_id).first()
    if schedule:
        schedule.last_watered = watered_at.date()
        schedule.next_watering = calculate_next_watering(watered_at.date(), schedule.frequency_days)

    db.commit()
    db.refresh(history)
    return history


@router.get("/plants/{plant_id}/watering/history", response_model=WateringHistoryListResponse)
async def get_watering_history(
    plant_id: int,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get watering history for a plant."""
    # Verify plant ownership
    verify_plant_ownership(plant_id, current_user.id, db)

    history = db.query(WateringHistory)\
        .filter(WateringHistory.plant_id == plant_id)\
        .order_by(WateringHistory.watered_at.desc())\
        .limit(limit)\
        .all()

    return {
        "history": history,
        "total": len(history)
    }
