"""Care recommendation search service using Google Custom Search."""
from typing import Dict, List
from app.services.google_search import google_search


class CareSearchService:
    """Service for searching plant care recommendations."""

    def __init__(self):
        self.google_search = google_search

    async def search_care_info(self, species: str, num_results: int = 3) -> Dict[str, List[Dict]]:
        """
        Search for comprehensive care information for a plant species.

        Performs multiple targeted searches for different care categories:
        - Lighting requirements
        - Watering needs
        - Humidity and temperature
        - General care tips

        Args:
            species: Scientific or common name of the plant
            num_results: Number of results per category (default: 3)

        Returns:
            Dictionary with categorized search results:
            {
                "lighting": [{"title": ..., "snippet": ..., "url": ..., "rank": ...}],
                "watering": [...],
                "humidity": [...],
                "general": [...]
            }
        """
        # Prepare search queries for different care aspects
        queries = {
            'lighting': f"{species} lighting requirements care guide",
            'watering': f"{species} watering schedule how often",
            'humidity': f"{species} humidity temperature needs",
            'general': f"{species} plant care tips indoor"
        }

        # Execute searches for each category
        results = {}
        for category, query in queries.items():
            category_results = await self.google_search.search_plant_problem(query, num_results)
            results[category] = category_results

        return results

    async def search_specific_care(
        self,
        species: str,
        care_type: str,
        num_results: int = 5
    ) -> List[Dict]:
        """
        Search for a specific type of care information.

        Args:
            species: Scientific or common name of the plant
            care_type: Type of care (e.g., "lighting", "watering", "soil", "fertilizing")
            num_results: Number of results to return

        Returns:
            List of search results for the specified care type
        """
        query = f"{species} {care_type} plant care guide"
        return await self.google_search.search_plant_problem(query, num_results)

    async def search_seasonal_care(self, species: str, num_results: int = 3) -> List[Dict]:
        """
        Search for seasonal care information.

        Args:
            species: Scientific or common name of the plant
            num_results: Number of results to return

        Returns:
            List of search results about seasonal care
        """
        query = f"{species} seasonal care winter summer outdoor indoor"
        return await self.google_search.search_plant_problem(query, num_results)

    async def search_room_placement(self, species: str, num_results: int = 3) -> List[Dict]:
        """
        Search for information about ideal room placement.

        Args:
            species: Scientific or common name of the plant
            num_results: Number of results to return

        Returns:
            List of search results about room placement
        """
        query = f"{species} best room placement indoor location house"
        return await self.google_search.search_plant_problem(query, num_results)

    def extract_care_summary(self, search_results: Dict[str, List[Dict]]) -> str:
        """
        Extract a summary from categorized search results.

        Args:
            search_results: Categorized search results from search_care_info()

        Returns:
            A text summary combining top snippets from each category
        """
        summary_parts = []

        for category, results in search_results.items():
            if results and len(results) > 0:
                # Get the top result snippet for this category
                top_snippet = results[0].get('snippet', '')
                if top_snippet:
                    summary_parts.append(f"{category.title()}: {top_snippet}")

        return " | ".join(summary_parts) if summary_parts else "Care information not available."


# Singleton instance
care_search = CareSearchService()
