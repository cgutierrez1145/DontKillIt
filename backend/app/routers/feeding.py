"""Feeding schedule and history endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.plant import Plant
from app.models.feeding import FeedingSchedule, FeedingHistory
from app.schemas.feeding import (
    FeedingScheduleCreate,
    FeedingScheduleUpdate,
    FeedingScheduleResponse,
    FeedingHistoryCreate,
    FeedingHistoryResponse,
    FeedingHistoryListResponse,
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


def calculate_next_feeding(last_fed: date, frequency_days: int) -> date:
    """Calculate the next feeding date based on last fed date and frequency."""
    return last_fed + timedelta(days=frequency_days)


@router.post("/plants/{plant_id}/feeding/schedule", response_model=FeedingScheduleResponse, status_code=status.HTTP_201_CREATED)
async def create_feeding_schedule(
    plant_id: int,
    schedule_data: FeedingScheduleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a feeding schedule for a plant."""
    # Verify plant ownership
    verify_plant_ownership(plant_id, current_user.id, db)

    # Check if schedule already exists
    existing = db.query(FeedingSchedule).filter(FeedingSchedule.plant_id == plant_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Feeding schedule already exists for this plant. Use PUT to update."
        )

    # Create new schedule
    schedule = FeedingSchedule(
        plant_id=plant_id,
        frequency_days=schedule_data.frequency_days
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


@router.get("/plants/{plant_id}/feeding/schedule", response_model=FeedingScheduleResponse)
async def get_feeding_schedule(
    plant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get feeding schedule for a plant."""
    # Verify plant ownership
    verify_plant_ownership(plant_id, current_user.id, db)

    schedule = db.query(FeedingSchedule).filter(FeedingSchedule.plant_id == plant_id).first()
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feeding schedule not found for this plant"
        )
    return schedule


@router.put("/plants/{plant_id}/feeding/schedule", response_model=FeedingScheduleResponse)
async def update_feeding_schedule(
    plant_id: int,
    schedule_data: FeedingScheduleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update feeding schedule for a plant."""
    # Verify plant ownership
    verify_plant_ownership(plant_id, current_user.id, db)

    schedule = db.query(FeedingSchedule).filter(FeedingSchedule.plant_id == plant_id).first()
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feeding schedule not found for this plant"
        )

    # Update fields
    if schedule_data.frequency_days is not None:
        schedule.frequency_days = schedule_data.frequency_days
        # Recalculate next feeding if last_fed exists
        if schedule.last_fed:
            schedule.next_feeding = calculate_next_feeding(schedule.last_fed, schedule.frequency_days)

    db.commit()
    db.refresh(schedule)
    return schedule


@router.delete("/plants/{plant_id}/feeding/schedule", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feeding_schedule(
    plant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete feeding schedule for a plant."""
    # Verify plant ownership
    verify_plant_ownership(plant_id, current_user.id, db)

    schedule = db.query(FeedingSchedule).filter(FeedingSchedule.plant_id == plant_id).first()
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feeding schedule not found for this plant"
        )

    db.delete(schedule)
    db.commit()
    return None


@router.post("/plants/{plant_id}/feeding/feed", response_model=FeedingHistoryResponse, status_code=status.HTTP_201_CREATED)
async def record_feeding(
    plant_id: int,
    feeding_data: FeedingHistoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record a feeding event and update the schedule."""
    # Verify plant ownership
    verify_plant_ownership(plant_id, current_user.id, db)

    # Use provided time or current time
    fed_at = feeding_data.fed_at or datetime.utcnow()

    # Create history entry
    history = FeedingHistory(
        plant_id=plant_id,
        fed_at=fed_at,
        notes=feeding_data.notes
    )
    db.add(history)

    # Update schedule if it exists
    schedule = db.query(FeedingSchedule).filter(FeedingSchedule.plant_id == plant_id).first()
    if schedule:
        schedule.last_fed = fed_at.date()
        schedule.next_feeding = calculate_next_feeding(fed_at.date(), schedule.frequency_days)

    db.commit()
    db.refresh(history)
    return history


@router.get("/plants/{plant_id}/feeding/history", response_model=FeedingHistoryListResponse)
async def get_feeding_history(
    plant_id: int,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get feeding history for a plant."""
    # Verify plant ownership
    verify_plant_ownership(plant_id, current_user.id, db)

    history = db.query(FeedingHistory)\
        .filter(FeedingHistory.plant_id == plant_id)\
        .order_by(FeedingHistory.fed_at.desc())\
        .limit(limit)\
        .all()

    return {
        "history": history,
        "total": len(history)
    }
