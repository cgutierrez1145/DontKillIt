"""Photo storage service for handling image uploads."""
import os
import uuid
from pathlib import Path
from typing import Optional
from fastapi import UploadFile
from PIL import Image
import io

from app.config import settings


class PhotoStorageService:
    """Service for storing and managing plant photos."""

    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.max_size = (1200, 1200)  # Max dimensions for compression

    async def save_photo(self, file: UploadFile, plant_id: int) -> str:
        """
        Save an uploaded photo with compression.

        Args:
            file: The uploaded file
            plant_id: ID of the plant this photo belongs to

        Returns:
            The URL/path to the saved photo
        """
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1] if file.filename else '.jpg'
        unique_filename = f"plant_{plant_id}_{uuid.uuid4().hex}{file_extension}"
        file_path = self.upload_dir / unique_filename

        # Read the uploaded file
        contents = await file.read()

        # Compress and save the image
        try:
            image = Image.open(io.BytesIO(contents))

            # Convert RGBA to RGB if necessary
            if image.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background

            # Resize if image is too large
            if image.size[0] > self.max_size[0] or image.size[1] > self.max_size[1]:
                image.thumbnail(self.max_size, Image.Resampling.LANCZOS)

            # Save with optimization
            image.save(file_path, 'JPEG', quality=85, optimize=True)

        except Exception as e:
            # If image processing fails, save the original file
            with open(file_path, 'wb') as f:
                f.write(contents)

        # Return the relative URL path
        return f"/photos/{unique_filename}"

    def delete_photo(self, photo_url: str) -> bool:
        """
        Delete a photo from storage.

        Args:
            photo_url: The URL/path of the photo to delete

        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            # Extract filename from URL
            filename = photo_url.split('/')[-1]
            file_path = self.upload_dir / filename

            if file_path.exists():
                file_path.unlink()
                return True
            return False
        except Exception:
            return False


# Singleton instance
photo_storage = PhotoStorageService()
