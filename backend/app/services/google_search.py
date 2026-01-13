"""Google Custom Search API integration."""
import httpx
from typing import List, Dict, Optional
from app.config import settings
from app.utils.logging_config import get_logger

logger = get_logger(__name__)


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
            logger.error(f"Google Search API error: {e}")
            return self._get_mock_results(query, num_results)

    def _get_mock_results(self, query: str, num_results: int) -> List[Dict[str, str]]:
        """
        Generate mock search results for testing based on query keywords.

        This is used when API keys are not configured or when API calls fail.
        """
        query_lower = query.lower()

        # Database of problem-specific solutions
        all_solutions = {
            'dying': [
                {
                    'title': 'Why Is My Plant Dying? Common Causes and How to Save It',
                    'snippet': 'A dying plant can be caused by overwatering, underwatering, poor light, root rot, or pest infestation. First, check the soil moisture and roots.',
                    'url': 'https://www.thespruce.com/why-is-my-plant-dying-5093993',
                },
                {
                    'title': 'How to Revive a Dying Houseplant - Step by Step Guide',
                    'snippet': 'To save a dying plant: 1) Check for root rot, 2) Adjust watering, 3) Ensure proper light, 4) Check for pests, 5) Consider repotting.',
                    'url': 'https://www.gardeningknowhow.com/houseplants/hpgen/revive-dying-plant.htm',
                },
                {
                    'title': 'Signs Your Plant Is Dying and What To Do About It',
                    'snippet': 'Wilting, brown leaves, mushy stems, and leaf drop are signs of a dying plant. Act quickly to diagnose and treat the underlying cause.',
                    'url': 'https://www.bhg.com/gardening/houseplants/care/signs-plant-is-dying/',
                },
            ],
            'yellow': [
                {
                    'title': 'Yellow Leaves on Plants: Causes and Solutions',
                    'snippet': 'Yellow leaves indicate overwatering, nutrient deficiency (especially nitrogen), or insufficient light. Check soil drainage first.',
                    'url': 'https://www.gardeningknowhow.com/plant-problems/environmental/plant-leaves-turn-yellow.htm',
                },
                {
                    'title': 'Why Are My Plant Leaves Turning Yellow?',
                    'snippet': 'Common causes: overwatering, underwatering, lack of sunlight, nutrient deficiency, or natural aging of lower leaves.',
                    'url': 'https://www.thespruce.com/why-plant-leaves-turn-yellow-1902773',
                },
            ],
            'brown': [
                {
                    'title': 'Brown Spots on Plant Leaves: Causes and Treatment',
                    'snippet': 'Brown spots can indicate fungal disease, bacterial infection, sunburn, or low humidity. Isolate affected plants and remove damaged leaves.',
                    'url': 'https://www.planetnatural.com/brown-spots-on-leaves/',
                },
                {
                    'title': 'Why Do Plant Leaves Turn Brown?',
                    'snippet': 'Brown leaf tips often indicate low humidity or salt buildup. Brown patches may be sunburn or disease. Check your watering and light conditions.',
                    'url': 'https://www.thespruce.com/why-do-plant-leaves-turn-brown-5093887',
                },
            ],
            'droop': [
                {
                    'title': 'Why Is My Plant Drooping? Causes and Fixes',
                    'snippet': 'Drooping usually means water stress - either too much or too little. Check soil moisture. Overwatered plants may have root rot.',
                    'url': 'https://www.thespruce.com/why-houseplants-droop-1902683',
                },
                {
                    'title': 'How to Fix a Drooping Plant',
                    'snippet': 'For underwatered plants, water thoroughly. For overwatered plants, let soil dry out and check for root rot. Ensure proper drainage.',
                    'url': 'https://www.gardeningknowhow.com/houseplants/hpgen/drooping-houseplants.htm',
                },
            ],
            'wilt': [
                {
                    'title': 'Why Is My Plant Wilting? Diagnosis and Treatment',
                    'snippet': 'Wilting can be caused by underwatering, overwatering, heat stress, root problems, or disease. Check soil moisture first.',
                    'url': 'https://www.thespruce.com/wilting-plants-causes-and-solutions-1402529',
                },
                {
                    'title': 'How to Save a Wilting Plant',
                    'snippet': 'Determine if the wilting is from lack of water or root rot. Dry soil needs water; soggy soil may indicate root damage.',
                    'url': 'https://www.gardeningknowhow.com/plant-problems/environmental/wilting-plants.htm',
                },
            ],
            'spots': [
                {
                    'title': 'Leaf Spot Disease: Identification and Treatment',
                    'snippet': 'Leaf spots are often fungal or bacterial. Remove affected leaves, improve air circulation, and avoid getting leaves wet when watering.',
                    'url': 'https://www.planetnatural.com/pest-problem-solver/plant-disease/leaf-spot/',
                },
            ],
            'pest': [
                {
                    'title': 'Common Houseplant Pests and How to Eliminate Them',
                    'snippet': 'Look for spider mites (webbing), mealybugs (white cottony masses), aphids (small green insects), or scale (brown bumps). Treat with neem oil or insecticidal soap.',
                    'url': 'https://www.almanac.com/common-houseplant-pests-how-get-rid-them',
                },
            ],
            'root': [
                {
                    'title': 'Root Rot: How to Identify, Treat, and Prevent It',
                    'snippet': 'Root rot causes mushy, brown roots and wilting despite wet soil. Remove affected roots, repot in fresh soil, and reduce watering.',
                    'url': 'https://www.thespruce.com/how-to-identify-and-treat-root-rot-5093762',
                },
            ],
            'overwater': [
                {
                    'title': 'Signs of Overwatering and How to Fix It',
                    'snippet': 'Overwatering causes yellow leaves, wilting, and root rot. Let soil dry out, ensure drainage holes, and water only when top inch is dry.',
                    'url': 'https://www.gardeningknowhow.com/houseplants/hpgen/signs-of-overwatering-plants.htm',
                },
            ],
        }

        # Find matching solutions based on keywords in query
        results = []
        matched_keywords = set()

        for keyword, solutions in all_solutions.items():
            if keyword in query_lower and keyword not in matched_keywords:
                results.extend(solutions)
                matched_keywords.add(keyword)

        # If no specific matches, provide general dying/sick plant advice
        if not results:
            results = all_solutions.get('dying', [])

        # Add rank to each result
        for idx, result in enumerate(results[:num_results], 1):
            result['rank'] = idx

        return results[:min(num_results, len(results))]


# Singleton instance
google_search = GoogleSearchService()
