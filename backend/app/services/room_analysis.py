"""Room lighting analysis service using basic image processing."""
from PIL import Image
import numpy as np
from typing import Dict
import os
from app.utils.logging_config import get_logger

logger = get_logger(__name__)


class RoomAnalysisService:
    """Service for analyzing room lighting from photos."""

    def __init__(self):
        # Thresholds for lighting categories (0.0 - 1.0 scale)
        self.thresholds = {
            'low': (0.0, 0.35),
            'medium': (0.35, 0.65),
            'bright': (0.65, 1.0)
        }

    async def analyze_lighting(self, image_path: str) -> Dict:
        """
        Analyze room lighting from photo using basic image brightness analysis.

        This uses PIL to compute average brightness and histogram analysis
        to determine the lighting level of a room.

        Args:
            image_path: Path to the room photo

        Returns:
            Dictionary with analysis results:
            {
                "lighting_score": 0.75,  # 0.0-1.0
                "category": "bright",  # "low", "medium", "bright"
                "confidence": 0.8,  # Confidence in the analysis
                "details": {
                    "avg_brightness": 180.5,
                    "bright_pixels_ratio": 0.65
                }
            }
        """
        try:
            # Check if file exists
            if not os.path.exists(image_path):
                return {
                    'lighting_score': None,
                    'category': None,
                    'confidence': 0.0,
                    'error': 'Image file not found',
                    'details': {}
                }

            # Open and process the image
            with Image.open(image_path) as img:
                # Convert to RGB if needed
                if img.mode != 'RGB':
                    img = img.convert('RGB')

                # Resize for faster processing (max 800px on longest side)
                max_size = 800
                if max(img.size) > max_size:
                    ratio = max_size / max(img.size)
                    new_size = tuple(int(dim * ratio) for dim in img.size)
                    img = img.resize(new_size, Image.Resampling.LANCZOS)

                # Convert to numpy array for analysis
                img_array = np.array(img)

                # Calculate average brightness (convert to grayscale)
                # Using luminosity method: 0.299*R + 0.587*G + 0.114*B
                grayscale = (
                    0.299 * img_array[:, :, 0] +
                    0.587 * img_array[:, :, 1] +
                    0.114 * img_array[:, :, 2]
                )

                avg_brightness = np.mean(grayscale)

                # Calculate ratio of bright pixels (>70% of max brightness)
                bright_pixels = np.sum(grayscale > 180)
                total_pixels = grayscale.size
                bright_ratio = bright_pixels / total_pixels

                # Calculate lighting score (0.0 - 1.0)
                # Weighted combination of average brightness and bright pixel ratio
                brightness_score = avg_brightness / 255.0
                lighting_score = (brightness_score * 0.7) + (bright_ratio * 0.3)

                # Determine category
                category = self._categorize_lighting(lighting_score)

                # Calculate confidence based on histogram spread
                confidence = self._calculate_confidence(grayscale)

                return {
                    'lighting_score': round(lighting_score, 3),
                    'category': category,
                    'confidence': round(confidence, 2),
                    'details': {
                        'avg_brightness': round(avg_brightness, 2),
                        'bright_pixels_ratio': round(bright_ratio, 3),
                        'image_size': img.size
                    }
                }

        except Exception as e:
            logger.error(f"Room analysis error: {e}")
            return {
                'lighting_score': None,
                'category': None,
                'confidence': 0.0,
                'error': str(e),
                'details': {}
            }

    def _categorize_lighting(self, score: float) -> str:
        """
        Categorize lighting score into low/medium/bright.

        Args:
            score: Lighting score (0.0 - 1.0)

        Returns:
            Category name: "low", "medium", or "bright"
        """
        for category, (min_val, max_val) in self.thresholds.items():
            if min_val <= score < max_val:
                return category

        # Default to bright if score is 1.0 or above threshold
        return "bright"

    def _calculate_confidence(self, grayscale: np.ndarray) -> float:
        """
        Calculate confidence in the analysis based on histogram characteristics.

        A more varied histogram (good distribution of light and dark areas)
        gives higher confidence than a very uniform image.

        Args:
            grayscale: Grayscale image array

        Returns:
            Confidence score (0.0 - 1.0)
        """
        # Calculate histogram
        histogram, _ = np.histogram(grayscale, bins=50, range=(0, 255))

        # Normalize histogram
        histogram = histogram / histogram.sum()

        # Calculate entropy (measure of randomness/variety)
        # Higher entropy = more varied lighting = higher confidence
        entropy = -np.sum(histogram * np.log2(histogram + 1e-10))

        # Normalize entropy to 0-1 range
        # Max entropy for 50 bins is log2(50) ≈ 5.64
        max_entropy = np.log2(50)
        confidence = min(entropy / max_entropy, 1.0)

        # Scale to practical range (0.5 - 0.95)
        # We're never 100% confident with basic image analysis
        confidence = 0.5 + (confidence * 0.45)

        return confidence


# Singleton instance
room_analysis = RoomAnalysisService()
