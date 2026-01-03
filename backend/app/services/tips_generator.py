"""Tips generator service for personalized plant care tips."""
from typing import List, Dict
from sqlalchemy.orm import Session
from app.models.plant import Plant
from app.models.tips import DidYouKnowTip
from app.services.google_search import google_search
from urllib.parse import urlparse


class TipsGeneratorService:
    """Service for generating personalized plant care tips."""

    def __init__(self):
        self.google_search = google_search

    async def generate_tips_for_user(
        self,
        user_id: int,
        db: Session,
        tips_per_species: int = 2
    ) -> List[Dict]:
        """
        Generate personalized tips based on user's plant collection.

        Args:
            user_id: User ID to generate tips for
            db: Database session
            tips_per_species: Number of tips to generate per unique species

        Returns:
            List of generated tip dictionaries
        """
        # Get unique species from user's plants
        user_plants = db.query(Plant).filter(Plant.user_id == user_id).all()

        if not user_plants:
            return []

        # Get unique species (filter out None/empty)
        species_set = set()
        for plant in user_plants:
            if plant.species:
                species_set.add(plant.species)
            elif plant.identified_common_name:
                species_set.add(plant.identified_common_name)

        if not species_set:
            return []

        # Generate tips for each species
        generated_tips = []
        for species in species_set:
            tips = await self.search_species_tips(species, tips_per_species)

            # Convert search results to tip format
            for tip in tips:
                # Check if this tip already exists for the user
                existing_tip = db.query(DidYouKnowTip).filter(
                    DidYouKnowTip.user_id == user_id,
                    DidYouKnowTip.url == tip['url']
                ).first()

                if not existing_tip:
                    tip_data = {
                        'user_id': user_id,
                        'species': species,
                        'plant_id': None,  # General species tip, not plant-specific
                        'title': tip['title'],
                        'content': tip['snippet'],
                        'url': tip['url'],
                        'source_domain': self._extract_domain(tip['url'])
                    }
                    generated_tips.append(tip_data)

        return generated_tips

    async def search_species_tips(
        self,
        species: str,
        num_results: int = 2
    ) -> List[Dict]:
        """
        Search for interesting facts and tips about a species.

        Args:
            species: Plant species name
            num_results: Number of tips to find

        Returns:
            List of search results formatted as tips
        """
        # Create search queries for interesting facts and tips
        queries = [
            f"{species} interesting facts did you know",
            f"{species} plant care secrets tips tricks",
            f"{species} common mistakes avoid care",
        ]

        all_results = []
        for query in queries:
            results = await self.google_search.search_plant_problem(query, num_results)
            all_results.extend(results)

        # Remove duplicates by URL
        seen_urls = set()
        unique_results = []
        for result in all_results:
            if result['url'] not in seen_urls:
                seen_urls.add(result['url'])
                unique_results.append(result)

        # Return requested number
        return unique_results[:num_results * 2]  # Get a few extra for variety

    async def search_seasonal_tips(
        self,
        species: str,
        num_results: int = 2
    ) -> List[Dict]:
        """
        Search for seasonal care tips.

        Args:
            species: Plant species name
            num_results: Number of tips to find

        Returns:
            List of seasonal care tips
        """
        query = f"{species} seasonal care tips winter summer spring fall"
        return await self.google_search.search_plant_problem(query, num_results)

    async def search_beginner_tips(
        self,
        species: str,
        num_results: int = 2
    ) -> List[Dict]:
        """
        Search for beginner-friendly tips.

        Args:
            species: Plant species name
            num_results: Number of tips to find

        Returns:
            List of beginner tips
        """
        query = f"{species} beginner guide easy care tips first time"
        return await self.google_search.search_plant_problem(query, num_results)

    async def search_problem_prevention_tips(
        self,
        species: str,
        num_results: int = 2
    ) -> List[Dict]:
        """
        Search for tips about preventing common problems.

        Args:
            species: Plant species name
            num_results: Number of tips to find

        Returns:
            List of problem prevention tips
        """
        query = f"{species} prevent common problems pests diseases yellowing"
        return await self.google_search.search_plant_problem(query, num_results)

    def _extract_domain(self, url: str) -> str:
        """
        Extract domain name from URL.

        Args:
            url: Full URL

        Returns:
            Domain name (e.g., "gardeningknowhow.com")
        """
        try:
            parsed = urlparse(url)
            return parsed.netloc
        except Exception:
            return "unknown"

    async def create_tips_from_results(
        self,
        user_id: int,
        species: str,
        search_results: List[Dict],
        db: Session,
        plant_id: int = None
    ) -> List[DidYouKnowTip]:
        """
        Create DidYouKnowTip database records from search results.

        Args:
            user_id: User ID
            species: Plant species
            search_results: Search results from any search method
            db: Database session
            plant_id: Optional specific plant ID

        Returns:
            List of created DidYouKnowTip objects
        """
        created_tips = []

        for result in search_results:
            # Check if tip already exists
            existing = db.query(DidYouKnowTip).filter(
                DidYouKnowTip.user_id == user_id,
                DidYouKnowTip.url == result['url']
            ).first()

            if not existing:
                tip = DidYouKnowTip(
                    user_id=user_id,
                    species=species,
                    plant_id=plant_id,
                    title=result['title'],
                    content=result['snippet'],
                    url=result['url'],
                    source_domain=self._extract_domain(result['url']),
                    is_read=False,
                    is_favorited=False
                )
                db.add(tip)
                created_tips.append(tip)

        db.commit()
        return created_tips


# Singleton instance
tips_generator = TipsGeneratorService()
