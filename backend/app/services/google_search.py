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
        Generate helpful advice based on query keywords.

        This is used when API keys are not configured or when API calls fail.
        Returns in-app tips instead of external links.
        """
        query_lower = query.lower()

        # Database of problem-specific solutions (no external URLs - these are in-app tips)
        all_solutions = {
            'dying': [
                {
                    'title': 'Check the Roots First',
                    'snippet': 'Gently remove the plant from its pot. Healthy roots are white or tan. Brown, mushy, or smelly roots indicate root rot - trim them and repot in fresh soil.',
                },
                {
                    'title': 'Assess Your Watering Habits',
                    'snippet': 'Overwatering is the #1 killer of houseplants. Only water when the top 1-2 inches of soil are dry. Ensure your pot has drainage holes.',
                },
                {
                    'title': 'Check Light Conditions',
                    'snippet': 'Most houseplants need bright, indirect light. Too little light causes weak growth; direct sun can burn leaves. Move your plant closer to or further from windows.',
                },
                {
                    'title': 'Look for Pests',
                    'snippet': 'Inspect under leaves and along stems for spider mites (tiny webs), mealybugs (white cotton), or scale (brown bumps). Treat with neem oil or insecticidal soap.',
                },
            ],
            'yellow': [
                {
                    'title': 'Overwatering is the Most Common Cause',
                    'snippet': 'Yellow leaves often mean too much water. Check if soil is soggy. Let it dry out and reduce watering frequency. Ensure pot has drainage.',
                },
                {
                    'title': 'Check for Nutrient Deficiency',
                    'snippet': 'If lower leaves yellow first, your plant may need nitrogen. Feed with a balanced liquid fertilizer during the growing season (spring/summer).',
                },
                {
                    'title': 'Evaluate Light Levels',
                    'snippet': 'Too little light can cause yellowing. Move to a brighter spot with indirect light. Avoid direct harsh sunlight which can also damage leaves.',
                },
            ],
            'brown': [
                {
                    'title': 'Brown Tips Usually Mean Low Humidity',
                    'snippet': 'Indoor air is often too dry. Mist your plant regularly, use a pebble tray with water, or place a humidifier nearby. Group plants together.',
                },
                {
                    'title': 'Brown Spots May Indicate Disease',
                    'snippet': 'Fungal or bacterial infections cause brown spots with yellow halos. Remove affected leaves, improve air circulation, and avoid wetting leaves when watering.',
                },
                {
                    'title': 'Check for Sunburn',
                    'snippet': 'Brown, crispy patches on sun-facing leaves suggest sunburn. Move plant away from direct sunlight or filter light with a sheer curtain.',
                },
            ],
            'droop': [
                {
                    'title': 'Check Soil Moisture Immediately',
                    'snippet': 'Drooping is usually water-related. Stick your finger 2 inches into soil. Bone dry? Water thoroughly. Soggy? Stop watering and check for root rot.',
                },
                {
                    'title': 'Drooping After Repotting is Normal',
                    'snippet': 'Plants often droop for 1-2 weeks after repotting due to transplant shock. Keep soil lightly moist, provide indirect light, and be patient.',
                },
                {
                    'title': 'Check for Root Bound Plants',
                    'snippet': 'If roots are circling the bottom or coming out drainage holes, the plant needs a bigger pot. Repot into a container 1-2 inches larger.',
                },
            ],
            'wilt': [
                {
                    'title': 'Wilting Despite Wet Soil = Root Rot',
                    'snippet': 'If soil is moist but plant wilts, roots may be damaged. Unpot, trim mushy roots, let dry, and repot in fresh well-draining soil.',
                },
                {
                    'title': 'Wilting in Dry Soil = Needs Water',
                    'snippet': 'Water thoroughly until it drains from the bottom. For severely dry soil, soak the pot in water for 30 minutes to rehydrate completely.',
                },
                {
                    'title': 'Heat Stress Can Cause Wilting',
                    'snippet': 'Plants near heaters, radiators, or hot windows may wilt from heat. Move to a cooler location and ensure adequate humidity.',
                },
            ],
            'spots': [
                {
                    'title': 'Identify the Spot Pattern',
                    'snippet': 'Random spots = fungal infection. Spots with yellow rings = bacterial. Water spots = mineral buildup. Identify the pattern to choose treatment.',
                },
                {
                    'title': 'Treat Fungal Leaf Spots',
                    'snippet': 'Remove affected leaves immediately. Improve air circulation. Water at soil level, not on leaves. Apply fungicide if spreading.',
                },
            ],
            'pest': [
                {
                    'title': 'Common Pest Identification',
                    'snippet': 'Spider mites: tiny webs under leaves. Mealybugs: white cottony masses. Aphids: small green/black insects. Scale: brown bumps on stems.',
                },
                {
                    'title': 'Natural Pest Treatment',
                    'snippet': 'Wipe leaves with soapy water. Spray with neem oil solution (1 tsp neem + 1 tsp dish soap + 1 quart water). Repeat weekly until gone.',
                },
                {
                    'title': 'Isolate Infected Plants',
                    'snippet': 'Move affected plants away from others immediately. Pests spread quickly. Check nearby plants regularly for signs of infestation.',
                },
            ],
            'root': [
                {
                    'title': 'How to Treat Root Rot',
                    'snippet': 'Remove plant from pot. Wash roots gently. Cut off all brown/mushy roots with sterile scissors. Let dry for a few hours. Repot in fresh, dry soil.',
                },
                {
                    'title': 'Prevent Future Root Rot',
                    'snippet': 'Use pots with drainage holes. Use well-draining soil (add perlite). Water only when top soil is dry. Empty saucers after watering.',
                },
            ],
            'overwater': [
                {
                    'title': 'Signs of Overwatering',
                    'snippet': 'Yellow leaves, mushy stems, fungus gnats, mold on soil surface, and a musty smell all indicate overwatering. Stop watering immediately.',
                },
                {
                    'title': 'How to Fix Overwatered Plant',
                    'snippet': 'Stop watering. Move to bright indirect light. If severe, unpot and let roots dry. Remove damaged roots. Repot in dry soil. Wait a week before watering.',
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
            results = list(all_solutions.get('dying', []))

        # Add rank and empty URL (in-app tips don't have external URLs)
        final_results = []
        for idx, result in enumerate(results[:num_results], 1):
            final_results.append({
                'title': result['title'],
                'snippet': result['snippet'],
                'url': '',  # No external URL for in-app tips
                'rank': idx
            })

        return final_results


# Singleton instance
google_search = GoogleSearchService()
