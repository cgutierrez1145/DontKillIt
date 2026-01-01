"""Google Custom Search API integration."""
import httpx
from typing import List, Dict, Optional
from app.config import settings


class GoogleSearchService:
    """Service for searching plant problems using Google Custom Search API."""

    def __init__(self):
        self.api_key = getattr(settings, 'GOOGLE_SEARCH_API_KEY', None)
        self.search_engine_id = getattr(settings, 'GOOGLE_SEARCH_ENGINE_ID', None)
        self.base_url = "https://www.googleapis.com/customsearch/v1"

    async def search_plant_problem(self, query: str, num_results: int = 10) -> List[Dict[str, str]]:
        """
        Search for plant problem solutions.

        Args:
            query: The search query describing the plant problem
            num_results: Number of results to return (max 10)

        Returns:
            List of search results with title, snippet, and URL
        """
        # Check if API keys are configured
        if not self.api_key or not self.search_engine_id:
            # Return mock data for testing without API keys
            return self._get_mock_results(query, num_results)

        try:
            async with httpx.AsyncClient() as client:
                params = {
                    'key': self.api_key,
                    'cx': self.search_engine_id,
                    'q': query,
                    'num': min(num_results, 10)  # Google API max is 10 per request
                }

                response = await client.get(self.base_url, params=params, timeout=10.0)
                response.raise_for_status()

                data = response.json()
                results = []

                if 'items' in data:
                    for idx, item in enumerate(data['items'], 1):
                        results.append({
                            'title': item.get('title', 'No title'),
                            'snippet': item.get('snippet', ''),
                            'url': item.get('link', ''),
                            'rank': idx
                        })

                return results

        except Exception as e:
            # Fall back to mock data if API call fails
            print(f"Google Search API error: {e}")
            return self._get_mock_results(query, num_results)

    def _get_mock_results(self, query: str, num_results: int) -> List[Dict[str, str]]:
        """
        Generate mock search results for testing.

        This is used when API keys are not configured or when API calls fail.
        """
        mock_solutions = [
            {
                'title': 'Yellow Leaves on Plants: Common Causes and Solutions',
                'snippet': 'Yellow leaves can indicate overwatering, nutrient deficiency, or insufficient light. Check soil moisture and adjust watering schedule.',
                'url': 'https://www.gardeningknowhow.com/plant-problems/environmental/plant-leaves-turn-yellow.htm',
                'rank': 1
            },
            {
                'title': 'How to Fix Drooping Plants - Complete Guide',
                'snippet': 'Drooping plants are often a sign of water stress (too much or too little). Check the soil and roots for proper diagnosis.',
                'url': 'https://www.thespruce.com/why-houseplants-droop-1902683',
                'rank': 2
            },
            {
                'title': 'Brown Spots on Plant Leaves: Identification and Treatment',
                'snippet': 'Brown spots can be caused by fungal diseases, bacterial infections, or sunburn. Identify the pattern and location of spots.',
                'url': 'https://www.planetnatural.com/brown-spots-on-leaves/',
                'rank': 3
            },
            {
                'title': 'Common Houseplant Pests and How to Get Rid of Them',
                'snippet': 'Spider mites, aphids, and mealybugs are common pests. Look for webbing, sticky residue, or visible insects.',
                'url': 'https://www.almanac.com/common-houseplant-pests-how-get-rid-them',
                'rank': 4
            },
            {
                'title': 'Plant Disease Diagnosis: A Visual Guide',
                'snippet': 'Learn to identify common plant diseases by their symptoms including leaf discoloration, wilting, and abnormal growth.',
                'url': 'https://extension.umn.edu/find-plants/plant-disease-diagnostic-tools',
                'rank': 5
            },
        ]

        # Return requested number of results
        return mock_solutions[:min(num_results, len(mock_solutions))]


# Singleton instance
google_search = GoogleSearchService()
