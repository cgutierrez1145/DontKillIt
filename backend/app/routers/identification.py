"""Plant identification endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.schemas.identification import PlantNetIdentificationResponse, PlantNetIdentificationResult, PetToxicityInfo
from app.utils.auth import get_current_user
from app.services.photo_storage import photo_storage
from app.services.plantnet import plantnet
from app.services.pet_toxicity import pet_toxicity_service
import os

router = APIRouter()


@router.post("/plants/identify", response_model=PlantNetIdentificationResponse, status_code=status.HTTP_200_OK)
async def identify_plant(
    file: UploadFile = File(...),
    organ: str = "auto",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Identify a plant from an uploaded photo using PlantNet API.

    This endpoint:
    1. Validates the uploaded file is an image
    2. Temporarily saves the photo
    3. Calls PlantNet API for identification
    4. Returns identification results without creating a plant

    Args:
        file: Plant photo file
        organ: Plant organ type ("auto", "flower", "leaf", "fruit", "bark")
        current_user: Authenticated user
        db: Database session

    Returns:
        PlantNet identification results with top match and all results
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )

    # Save photo temporarily (using a temp plant_id of 0)
    temp_photo_path = await photo_storage.save_photo(file, plant_id=0)

    # Get full path for PlantNet API
    # Remove the /photos/ prefix to get just the filename
    filename = temp_photo_path.replace('/photos/', '', 1)
    full_path = os.path.join(photo_storage.upload_dir, filename)

    try:
        # Call PlantNet API
        identification_result = await plantnet.identify_plant(full_path, organ)

        # Build response with all results
        all_results = []
        if identification_result.get('all_results'):
            for result in identification_result['all_results']:
                if result.get('species'):  # Only include valid results
                    # Look up pet toxicity for this result
                    toxicity_data = await pet_toxicity_service.get_toxicity(
                        species=result.get('species'),
                        common_name=result.get('common_name'),
                        genus=result.get('genus')
                    )
                    pet_toxicity = PetToxicityInfo(**toxicity_data) if toxicity_data else None

                    all_results.append(PlantNetIdentificationResult(
                        species=result.get('species', 'Unknown'),
                        common_name=result.get('common_name'),
                        confidence=result.get('confidence', 0.0),
                        family=result.get('family'),
                        genus=result.get('genus'),
                        pet_toxicity=pet_toxicity
                    ))

        # Get top result
        top_result = None
        if identification_result.get('species'):
            # Look up pet toxicity for top result
            top_toxicity_data = await pet_toxicity_service.get_toxicity(
                species=identification_result.get('species'),
                common_name=identification_result.get('common_name'),
                genus=identification_result.get('genus')
            )
            top_pet_toxicity = PetToxicityInfo(**top_toxicity_data) if top_toxicity_data else None

            top_result = PlantNetIdentificationResult(
                species=identification_result['species'],
                common_name=identification_result.get('common_name'),
                confidence=identification_result.get('confidence', 0.0),
                family=identification_result.get('family'),
                genus=identification_result.get('genus'),
                pet_toxicity=top_pet_toxicity
            )

        response = PlantNetIdentificationResponse(
            results=all_results,
            top_result=top_result,
            total_results=len(all_results),
            photo_url=temp_photo_path  # Include photo URL so frontend can use it when creating plant
        )

        return response

    except Exception as e:
        # Only clean up photo on error
        try:
            if os.path.exists(full_path):
                os.remove(full_path)
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Plant identification failed: {str(e)}"
        )
    # Note: Photo is NOT deleted on success - it will be used when creating the plant
