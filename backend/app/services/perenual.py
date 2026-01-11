"""Perenual API integration for plant care data enrichment."""
import httpx
from typing import Dict, List, Optional, Any
from app.config import settings
from app.utils.logging_config import get_logger

logger = get_logger(__name__)


class PerenualService:
    """Service for fetching plant data from Perenual API.

    Free tier: 100 requests/day
    API docs: https://perenual.com/docs/api
    """

    def __init__(self):
        self.api_key = getattr(settings, 'PERENUAL_API_KEY', None)
        self.base_url = "https://perenual.com/api/v2"
        self.requests_today = 0
        self.daily_limit = 100  # Free tier limit

    async def search_plant(self, query: str, indoor: Optional[bool] = True) -> Optional[Dict[str, Any]]:
        """
        Search for a plant by name and return the best match.

        Args:
            query: Plant name to search for (common name or scientific name)
            indoor: Filter for indoor plants only

        Returns:
            Dictionary with plant data or None if not found
        """
        if not self.api_key:
            logger.warning("Perenual API key not configured, returning None")
            return None

        try:
            logger.info(f"Searching Perenual for: {query}")
            async with httpx.AsyncClient() as client:
                params = {
                    'key': self.api_key,
                    'q': query,
                }
                if indoor is not None:
                    params['indoor'] = 1 if indoor else 0

                response = await client.get(
                    f"{self.base_url}/species-list",
                    params=params,
                    timeout=30.0
                )

                # Handle rate limiting
                if response.status_code == 429:
                    logger.warning("Perenual API rate limit hit, waiting 60 seconds...")
                    import asyncio
                    await asyncio.sleep(60)
                    response = await client.get(
                        f"{self.base_url}/species-list",
                        params=params,
                        timeout=30.0
                    )

                response.raise_for_status()
                self.requests_today += 1

                data = response.json()
                logger.debug(f"Perenual search response: {data}")

                if data.get('data') and len(data['data']) > 0:
                    # Return the first (best) match
                    return data['data'][0]

                return None

        except Exception as e:
            logger.error(f"Perenual search error: {e}")
            return None

    async def get_plant_details(self, plant_id: int) -> Optional[Dict[str, Any]]:
        """
        Get detailed plant information by Perenual plant ID.

        Args:
            plant_id: Perenual plant ID

        Returns:
            Dictionary with detailed plant data or None if not found
        """
        if not self.api_key:
            logger.warning("Perenual API key not configured, returning None")
            return None

        try:
            logger.info(f"Fetching Perenual details for plant ID: {plant_id}")
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/species/details/{plant_id}",
                    params={'key': self.api_key},
                    timeout=30.0
                )

                # Handle rate limiting
                if response.status_code == 429:
                    logger.warning("Perenual API rate limit hit, waiting 60 seconds...")
                    import asyncio
                    await asyncio.sleep(60)
                    response = await client.get(
                        f"{self.base_url}/species/details/{plant_id}",
                        params={'key': self.api_key},
                        timeout=30.0
                    )

                response.raise_for_status()
                self.requests_today += 1

                data = response.json()
                logger.debug(f"Perenual details response: {data}")
                return data

        except Exception as e:
            logger.error(f"Perenual details error: {e}")
            return None

    async def search_and_get_details(self, query: str) -> Optional[Dict[str, Any]]:
        """
        Search for a plant and get its detailed information in one call.
        Uses 2 API calls.

        Args:
            query: Plant name to search for

        Returns:
            Dictionary with complete plant data or None if not found
        """
        # First search for the plant
        search_result = await self.search_plant(query)

        if not search_result:
            # Try searching without indoor filter
            search_result = await self.search_plant(query, indoor=None)

        if not search_result or 'id' not in search_result:
            return None

        # Get detailed information
        details = await self.get_plant_details(search_result['id'])

        if details:
            # Merge search result with details
            return {**search_result, **details}

        return search_result

    async def get_pest_diseases(self, query: str = None) -> List[Dict[str, Any]]:
        """
        Get list of plant pests and diseases.

        Args:
            query: Optional search query

        Returns:
            List of pest/disease information
        """
        if not self.api_key:
            logger.warning("Perenual API key not configured, returning empty list")
            return []

        try:
            async with httpx.AsyncClient() as client:
                params = {'key': self.api_key}
                if query:
                    params['q'] = query

                response = await client.get(
                    f"{self.base_url}/pest-disease-list",
                    params=params,
                    timeout=30.0
                )
                response.raise_for_status()
                self.requests_today += 1

                data = response.json()
                return data.get('data', [])

        except Exception as e:
            logger.error(f"Perenual pest/disease error: {e}")
            return []

    def parse_watering_frequency(self, watering_value: str) -> Optional[int]:
        """
        Convert Perenual watering description to days between watering.

        Args:
            watering_value: "Frequent", "Average", "Minimum", "None"

        Returns:
            Estimated days between watering
        """
        watering_map = {
            'frequent': 3,      # Every 2-3 days
            'average': 7,       # Weekly
            'minimum': 14,      # Every 2 weeks
            'none': 30,         # Monthly or less (succulents, cacti)
        }

        if watering_value:
            return watering_map.get(watering_value.lower(), 7)
        return None

    def parse_sunlight_requirement(self, sunlight_values: List[str]) -> str:
        """
        Convert Perenual sunlight list to lighting requirement string.

        Args:
            sunlight_values: List like ["full sun", "part shade"]

        Returns:
            Lighting requirement string
        """
        if not sunlight_values:
            return "medium"

        # Priority mapping
        sunlight_priority = {
            'full_sun': 'direct sun',
            'full sun': 'direct sun',
            'sun-part_shade': 'bright indirect',
            'sun-part shade': 'bright indirect',
            'part_shade': 'medium',
            'part shade': 'medium',
            'full_shade': 'low',
            'full shade': 'low',
        }

        for sun in sunlight_values:
            normalized = sun.lower().replace(' ', '_')
            if normalized in sunlight_priority:
                return sunlight_priority[normalized]
            # Try without underscore
            if sun.lower() in sunlight_priority:
                return sunlight_priority[sun.lower()]

        return "medium"

    def extract_care_data(self, plant_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract and normalize care data from Perenual response.

        Args:
            plant_data: Raw Perenual API response

        Returns:
            Normalized care data dictionary
        """
        care_data = {
            'perenual_id': plant_data.get('id'),
            'common_name': plant_data.get('common_name'),
            'scientific_name': None,
            'watering': plant_data.get('watering'),
            'watering_frequency_days': None,
            'sunlight': plant_data.get('sunlight', []),
            'lighting_requirement': None,
            'cycle': plant_data.get('cycle'),  # annual, perennial, biennial
            'care_level': plant_data.get('care_level'),  # Low, Medium, High
            'growth_rate': plant_data.get('growth_rate'),  # Low, Medium, High
            'maintenance': plant_data.get('maintenance'),  # Low, Medium, High
            'hardiness_min': None,
            'hardiness_max': None,
            'indoor': plant_data.get('indoor'),
            'poisonous_to_pets': plant_data.get('poisonous_to_pets'),
            'poisonous_to_humans': plant_data.get('poisonous_to_humans'),
            'drought_tolerant': plant_data.get('drought_tolerant'),
            'soil': plant_data.get('soil', []),
            'flowering_season': plant_data.get('flowering_season'),
            'description': plant_data.get('description'),
            'default_image': None,
            'origin': plant_data.get('origin', []),
            'propagation': plant_data.get('propagation', []),
            'watering_general_benchmark': plant_data.get('watering_general_benchmark'),
        }

        # Extract scientific name from list
        scientific_names = plant_data.get('scientific_name', [])
        if scientific_names and isinstance(scientific_names, list):
            care_data['scientific_name'] = scientific_names[0]
        elif isinstance(scientific_names, str):
            care_data['scientific_name'] = scientific_names

        # Parse watering frequency
        if care_data['watering']:
            care_data['watering_frequency_days'] = self.parse_watering_frequency(care_data['watering'])

        # Parse sunlight requirement
        if care_data['sunlight']:
            care_data['lighting_requirement'] = self.parse_sunlight_requirement(care_data['sunlight'])

        # Extract hardiness zones
        hardiness = plant_data.get('hardiness', {})
        if hardiness:
            care_data['hardiness_min'] = hardiness.get('min')
            care_data['hardiness_max'] = hardiness.get('max')

        # Extract default image URL
        default_image = plant_data.get('default_image')
        if default_image:
            care_data['default_image'] = default_image.get('regular_url') or default_image.get('medium_url')

        # Parse watering benchmark
        benchmark = plant_data.get('watering_general_benchmark')
        if benchmark and isinstance(benchmark, dict):
            # Try to get a specific day interval
            value = benchmark.get('value')
            unit = benchmark.get('unit', '').lower()
            if value and 'day' in unit:
                try:
                    # Handle ranges like "5-7"
                    if '-' in str(value):
                        parts = str(value).split('-')
                        care_data['watering_frequency_days'] = int(parts[0])
                    else:
                        care_data['watering_frequency_days'] = int(value)
                except (ValueError, TypeError):
                    pass

        return care_data

    def remaining_requests(self) -> int:
        """Return estimated remaining API requests for today."""
        return max(0, self.daily_limit - self.requests_today)

    def reset_daily_counter(self):
        """Reset the daily request counter (called at midnight)."""
        self.requests_today = 0


# Singleton instance
perenual_service = PerenualService()
