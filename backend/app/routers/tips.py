"""Did You Know tips endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.tips import DidYouKnowTip
from app.schemas.tips import (
    DidYouKnowTipResponse,
    DidYouKnowTipListResponse,
    DidYouKnowTipUpdate
)
from app.utils.auth import get_current_user
from app.services.tips_generator import tips_generator

router = APIRouter()


@router.get("/tips", response_model=DidYouKnowTipListResponse)
async def get_tips(
    species: Optional[str] = Query(None, description="Filter by plant species"),
    is_read: Optional[bool] = Query(None, description="Filter by read status"),
    is_favorited: Optional[bool] = Query(None, description="Filter by favorited status"),
    limit: int = Query(10, ge=1, le=100, description="Number of tips to return"),
    offset: int = Query(0, ge=0, description="Number of tips to skip"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get personalized tips for the current user.

    Supports filtering by species, read status, and favorited status.
    Returns paginated results.
    """
    # Build query
    query = db.query(DidYouKnowTip).filter(DidYouKnowTip.user_id == current_user.id)

    # Apply filters
    if species is not None:
        query = query.filter(DidYouKnowTip.species == species)
    if is_read is not None:
        query = query.filter(DidYouKnowTip.is_read == is_read)
    if is_favorited is not None:
        query = query.filter(DidYouKnowTip.is_favorited == is_favorited)

    # Get total count
    total = query.count()

    # Apply pagination and order
    tips = query.order_by(DidYouKnowTip.created_at.desc()).offset(offset).limit(limit).all()

    return DidYouKnowTipListResponse(
        tips=[DidYouKnowTipResponse.model_validate(tip) for tip in tips],
        total=total
    )


@router.post("/tips/generate", response_model=DidYouKnowTipListResponse, status_code=status.HTTP_201_CREATED)
async def generate_tips(
    tips_per_species: int = Query(2, ge=1, le=5, description="Tips to generate per species"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate new personalized tips based on user's plant collection.

    This endpoint:
    1. Finds all unique species in user's plant collection
    2. Searches for interesting facts and care tips for each species
    3. Creates new tip records (avoids duplicates)
    4. Returns the newly generated tips
    """
    # Generate tips
    tip_data_list = await tips_generator.generate_tips_for_user(
        user_id=current_user.id,
        db=db,
        tips_per_species=tips_per_species
    )

    if not tip_data_list:
        return DidYouKnowTipListResponse(
            tips=[],
            total=0
        )

    # Create tip records
    created_tips = []
    for tip_data in tip_data_list:
        tip = DidYouKnowTip(**tip_data)
        db.add(tip)
        created_tips.append(tip)

    db.commit()

    # Refresh to get IDs and timestamps
    for tip in created_tips:
        db.refresh(tip)

    return DidYouKnowTipListResponse(
        tips=[DidYouKnowTipResponse.model_validate(tip) for tip in created_tips],
        total=len(created_tips)
    )


@router.get("/tips/{tip_id}", response_model=DidYouKnowTipResponse)
async def get_tip(
    tip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific tip by ID.

    Verifies that the tip belongs to the current user.
    """
    tip = db.query(DidYouKnowTip).filter(
        DidYouKnowTip.id == tip_id,
        DidYouKnowTip.user_id == current_user.id
    ).first()

    if not tip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tip not found"
        )

    return DidYouKnowTipResponse.model_validate(tip)


@router.put("/tips/{tip_id}", response_model=DidYouKnowTipResponse)
async def update_tip(
    tip_id: int,
    tip_update: DidYouKnowTipUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a tip's read or favorited status.

    Allows marking tips as read or favorited.
    """
    tip = db.query(DidYouKnowTip).filter(
        DidYouKnowTip.id == tip_id,
        DidYouKnowTip.user_id == current_user.id
    ).first()

    if not tip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tip not found"
        )

    # Update fields if provided
    if tip_update.is_read is not None:
        tip.is_read = tip_update.is_read
    if tip_update.is_favorited is not None:
        tip.is_favorited = tip_update.is_favorited

    db.commit()
    db.refresh(tip)

    return DidYouKnowTipResponse.model_validate(tip)


@router.delete("/tips/{tip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tip(
    tip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a tip.

    Verifies that the tip belongs to the current user.
    """
    tip = db.query(DidYouKnowTip).filter(
        DidYouKnowTip.id == tip_id,
        DidYouKnowTip.user_id == current_user.id
    ).first()

    if not tip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tip not found"
        )

    db.delete(tip)
    db.commit()

    return None


@router.get("/tips/species/{species}", response_model=DidYouKnowTipListResponse)
async def get_tips_by_species(
    species: str,
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all tips for a specific plant species.

    Returns tips filtered by species name.
    """
    tips = db.query(DidYouKnowTip).filter(
        DidYouKnowTip.user_id == current_user.id,
        DidYouKnowTip.species == species
    ).order_by(DidYouKnowTip.created_at.desc()).limit(limit).all()

    return DidYouKnowTipListResponse(
        tips=[DidYouKnowTipResponse.model_validate(tip) for tip in tips],
        total=len(tips)
    )
