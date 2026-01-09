"""PlantNet API integration for plant identification."""
import httpx
from typing import Dict, List, Optional
from app.config import settings
from app.utils.logging_config import get_logger

logger = get_logger(__name__)


class PlantNetService:
    """Service for plant identification using PlantNet API."""

    def __init__(self):
        self.api_key = getattr(settings, 'PLANTNET_API_KEY', None)
        self.base_url = "https://my-api.plantnet.org/v2"
        self.project = "all"  # Can be "all", "weurope", "k-world-flora", etc.

    async def identify_plant(
        self,
        image_path: str,
        organ: str = "auto"
    ) -> Dict:
        """
        Identify plant from image.

        Args:
            image_path: Path to the plant image file
            organ: Plant organ type ("auto", "flower", "leaf", "fruit", "bark")

        Returns:
            Dictionary with identification results:
            {
                "species": "Scientific name",
                "common_name": "Common name",
                "confidence": 0.87,
                "family": "Plant family",
                "genus": "Plant genus",
                "all_results": [list of all matches]
            }
        """
        # Check if API key is configured
        if not self.api_key:
            # Return mock data for testing without API key
            return self._get_mock_identification(image_path)

        try:
            async with httpx.AsyncClient() as client:
                # Prepare the request
                url = f"{self.base_url}/identify/{self.project}"
                params = {
                    'api-key': self.api_key,
                }

                # Open and send the image file
                with open(image_path, 'rb') as image_file:
                    files = {'images': image_file}

                    # Add organ parameter if specified
                    if organ != "auto":
                        files['organs'] = organ

                    response = await client.post(
                        url,
                        params=params,
                        files=files,
                        timeout=30.0
                    )
                    response.raise_for_status()

                data = response.json()

                # Parse the response
                if 'results' in data and len(data['results']) > 0:
                    # Get the top result
                    top_result = data['results'][0]
                    species_data = top_result.get('species', {})

                    # Extract common names
                    common_names = species_data.get('commonNames', [])
                    common_name = common_names[0] if common_names else None

                    # Build all results list
                    all_results = []
                    for result in data['results'][:5]:  # Top 5 results
                        sp = result.get('species', {})
                        all_results.append({
                            'species': sp.get('scientificNameWithoutAuthor', 'Unknown'),
                            'common_name': sp.get('commonNames', [None])[0],
                            'confidence': result.get('score', 0.0),
                            'family': sp.get('family', {}).get('scientificNameWithoutAuthor'),
                            'genus': sp.get('genus', {}).get('scientificNameWithoutAuthor')
                        })

                    return {
                        'species': species_data.get('scientificNameWithoutAuthor', 'Unknown'),
                        'common_name': common_name,
                        'confidence': top_result.get('score', 0.0),
                        'family': species_data.get('family', {}).get('scientificNameWithoutAuthor'),
                        'genus': species_data.get('genus', {}).get('scientificNameWithoutAuthor'),
                        'all_results': all_results
                    }
                else:
                    # No results found
                    return {
                        'species': None,
                        'common_name': None,
                        'confidence': 0.0,
                        'family': None,
                        'genus': None,
                        'all_results': [],
                        'error': 'No identification results found'
                    }

        except FileNotFoundError:
            return {
                'species': None,
                'common_name': None,
                'confidence': 0.0,
                'family': None,
                'genus': None,
                'all_results': [],
                'error': 'Image file not found'
            }
        except Exception as e:
            # Fall back to mock data if API call fails
            logger.error(f"PlantNet API error: {e}")
            return self._get_mock_identification(image_path)

    def _get_mock_identification(self, image_path: str) -> Dict:
        """
        Generate mock identification results for testing.

        This is used when API key is not configured or when API calls fail.
        """
        # Simple mock data based on common houseplants
        mock_identifications = [
            {
                'species': 'Monstera deliciosa',
                'common_name': 'Swiss Cheese Plant',
                'confidence': 0.87,
                'family': 'Araceae',
                'genus': 'Monstera',
                'all_results': [
                    {
                        'species': 'Monstera deliciosa',
                        'common_name': 'Swiss Cheese Plant',
                        'confidence': 0.87,
                        'family': 'Araceae',
                        'genus': 'Monstera'
                    },
                    {
                        'species': 'Monstera adansonii',
                        'common_name': 'Adanson\'s Monstera',
                        'confidence': 0.65,
                        'family': 'Araceae',
                        'genus': 'Monstera'
                    }
                ]
            },
            {
                'species': 'Ficus elastica',
                'common_name': 'Rubber Plant',
                'confidence': 0.92,
                'family': 'Moraceae',
                'genus': 'Ficus',
                'all_results': [
                    {
                        'species': 'Ficus elastica',
                        'common_name': 'Rubber Plant',
                        'confidence': 0.92,
                        'family': 'Moraceae',
                        'genus': 'Ficus'
                    }
                ]
            },
            {
                'species': 'Pothos aureus',
                'common_name': 'Golden Pothos',
                'confidence': 0.78,
                'family': 'Araceae',
                'genus': 'Epipremnum',
                'all_results': [
                    {
                        'species': 'Pothos aureus',
                        'common_name': 'Golden Pothos',
                        'confidence': 0.78,
                        'family': 'Araceae',
                        'genus': 'Epipremnum'
                    }
                ]
            }
        ]

        # Simulate variation by using image_path hash to pick a result
        index = hash(image_path) % len(mock_identifications)
        result = mock_identifications[index].copy()
        result['mock'] = True  # Flag to indicate this is mock data

        return result


# Singleton instance
plantnet = PlantNetService()
