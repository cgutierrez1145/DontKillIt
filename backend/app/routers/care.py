"""Plant care recommendations endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.plant import Plant
from app.models.care_recommendation import PlantCareRecommendation
from app.schemas.care import (
    PlantCareRecommendationResponse,
    PlantCareRecommendationListResponse,
    CareSearchResult
)
from app.utils.auth import get_current_user
from app.services.care_search import care_search

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


@router.get("/plants/{plant_id}/care-recommendations", response_model=PlantCareRecommendationListResponse)
async def get_care_recommendations(
    plant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all care recommendations for a plant.

    Returns stored care recommendations grouped by source.
    """
    # Verify plant ownership
    plant = verify_plant_ownership(plant_id, current_user.id, db)

    # Get all care recommendations for this plant
    recommendations = db.query(PlantCareRecommendation).filter(
        PlantCareRecommendation.plant_id == plant_id
    ).order_by(PlantCareRecommendation.rank).all()

    return PlantCareRecommendationListResponse(
        recommendations=[PlantCareRecommendationResponse.model_validate(rec) for rec in recommendations],
        total=len(recommendations)
    )


@router.post("/plants/{plant_id}/refresh-care", response_model=PlantCareRecommendationListResponse, status_code=status.HTTP_201_CREATED)
async def refresh_care_recommendations(
    plant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Refresh care recommendations for a plant by performing new searches.

    This endpoint:
    1. Searches for fresh care information using Google Custom Search
    2. Deletes old recommendations
    3. Creates new recommendations from search results
    4. Returns the new recommendations
    """
    # Verify plant ownership
    plant = verify_plant_ownership(plant_id, current_user.id, db)

    # Check if plant has species information
    species = plant.species or plant.identified_common_name
    if not species:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Plant must have species or common name for care recommendations"
        )

    # Delete existing recommendations
    db.query(PlantCareRecommendation).filter(
        PlantCareRecommendation.plant_id == plant_id
    ).delete()
    db.commit()

    # Search for new care information
    care_results = await care_search.search_care_info(species, num_results=3)

    # Create new care recommendations from search results
    created_recommendations = []
    rank = 1

    # Process each category
    for category, results in care_results.items():
        for result in results:
            # Create a recommendation for each search result
            recommendation = PlantCareRecommendation(
                plant_id=plant_id,
                species_name=species,
                source_url=result['url'],
                source_title=result['title'],
                rank=rank
            )

            # Assign the snippet to the appropriate category field
            if category == 'lighting':
                recommendation.lighting = result['snippet']
            elif category == 'watering':
                recommendation.watering = result['snippet']
            elif category == 'humidity':
                recommendation.humidity = result['snippet']
            elif category == 'general':
                # For general results, distribute across fields
                recommendation.room_placement = result['snippet']

            db.add(recommendation)
            created_recommendations.append(recommendation)
            rank += 1

    db.commit()

    # Refresh to get IDs and timestamps
    for rec in created_recommendations:
        db.refresh(rec)

    # Update plant's care_summary
    care_summary = care_search.extract_care_summary(care_results)
    plant.care_summary = care_summary
    db.commit()

    return PlantCareRecommendationListResponse(
        recommendations=[PlantCareRecommendationResponse.model_validate(rec) for rec in created_recommendations],
        total=len(created_recommendations)
    )


@router.delete("/care-recommendations/{recommendation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_care_recommendation(
    recommendation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a specific care recommendation.

    Verifies that the recommendation belongs to a plant owned by the current user.
    """
    # Get the recommendation
    recommendation = db.query(PlantCareRecommendation).filter(
        PlantCareRecommendation.id == recommendation_id
    ).first()

    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Care recommendation not found"
        )

    # Verify plant ownership
    plant = db.query(Plant).filter(Plant.id == recommendation.plant_id).first()
    if not plant or plant.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this recommendation"
        )

    db.delete(recommendation)
    db.commit()

    return None
