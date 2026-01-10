"""Pet toxicity lookup service for plants."""
from typing import Optional, Dict, Any
from dataclasses import dataclass
from app.services.google_search import google_search
from app.utils.logging_config import get_logger

logger = get_logger(__name__)


@dataclass
class ToxicityInfo:
    """Pet toxicity information for a plant."""
    pet_friendly: bool
    toxicity_level: str  # "safe", "mild", "moderate", "severe"
    toxic_parts: Optional[str] = None
    symptoms: Optional[str] = None
    source: str = "ASPCA"


# Comprehensive database of common houseplant toxicity
# Data sourced from ASPCA Animal Poison Control Center
TOXICITY_DATABASE: Dict[str, ToxicityInfo] = {
    # ============ TOXIC PLANTS ============

    # Severe toxicity
    "Lilium": ToxicityInfo(
        pet_friendly=False, toxicity_level="severe",
        toxic_parts="All parts, especially flowers and pollen",
        symptoms="Kidney failure in cats, vomiting, lethargy"
    ),
    "Cycas revoluta": ToxicityInfo(
        pet_friendly=False, toxicity_level="severe",
        toxic_parts="All parts, especially seeds",
        symptoms="Vomiting, diarrhea, liver failure, death"
    ),
    "Nerium oleander": ToxicityInfo(
        pet_friendly=False, toxicity_level="severe",
        toxic_parts="All parts",
        symptoms="Heart arrhythmias, vomiting, death"
    ),
    "Rhododendron": ToxicityInfo(
        pet_friendly=False, toxicity_level="severe",
        toxic_parts="All parts",
        symptoms="Vomiting, diarrhea, cardiac failure"
    ),
    "Azalea": ToxicityInfo(
        pet_friendly=False, toxicity_level="severe",
        toxic_parts="All parts",
        symptoms="Vomiting, diarrhea, cardiac failure"
    ),
    "Tulipa": ToxicityInfo(
        pet_friendly=False, toxicity_level="severe",
        toxic_parts="Bulbs",
        symptoms="Vomiting, diarrhea, hypersalivation"
    ),

    # Moderate toxicity
    "Monstera deliciosa": ToxicityInfo(
        pet_friendly=False, toxicity_level="moderate",
        toxic_parts="All parts, especially leaves",
        symptoms="Oral irritation, drooling, vomiting, difficulty swallowing"
    ),
    "Monstera": ToxicityInfo(
        pet_friendly=False, toxicity_level="moderate",
        toxic_parts="All parts",
        symptoms="Oral irritation, drooling, vomiting"
    ),
    "Philodendron": ToxicityInfo(
        pet_friendly=False, toxicity_level="moderate",
        toxic_parts="All parts",
        symptoms="Oral irritation, swelling, drooling, vomiting"
    ),
    "Philodendron hederaceum": ToxicityInfo(
        pet_friendly=False, toxicity_level="moderate",
        toxic_parts="All parts",
        symptoms="Oral irritation, swelling, drooling"
    ),
    "Epipremnum aureum": ToxicityInfo(
        pet_friendly=False, toxicity_level="moderate",
        toxic_parts="All parts",
        symptoms="Oral irritation, drooling, vomiting"
    ),
    "Dieffenbachia": ToxicityInfo(
        pet_friendly=False, toxicity_level="moderate",
        toxic_parts="All parts",
        symptoms="Intense oral irritation, drooling, difficulty swallowing"
    ),
    "Spathiphyllum": ToxicityInfo(
        pet_friendly=False, toxicity_level="moderate",
        toxic_parts="All parts",
        symptoms="Oral irritation, drooling, vomiting"
    ),
    "Caladium": ToxicityInfo(
        pet_friendly=False, toxicity_level="moderate",
        toxic_parts="All parts",
        symptoms="Oral irritation, drooling, vomiting"
    ),
    "Alocasia": ToxicityInfo(
        pet_friendly=False, toxicity_level="moderate",
        toxic_parts="All parts",
        symptoms="Oral irritation, swelling, drooling"
    ),
    "Colocasia": ToxicityInfo(
        pet_friendly=False, toxicity_level="moderate",
        toxic_parts="All parts",
        symptoms="Oral irritation, swelling, drooling"
    ),
    "Anthurium": ToxicityInfo(
        pet_friendly=False, toxicity_level="moderate",
        toxic_parts="All parts",
        symptoms="Oral irritation, drooling, vomiting"
    ),
    "Syngonium podophyllum": ToxicityInfo(
        pet_friendly=False, toxicity_level="moderate",
        toxic_parts="All parts",
        symptoms="Oral irritation, drooling, vomiting"
    ),
    "Zantedeschia": ToxicityInfo(
        pet_friendly=False, toxicity_level="moderate",
        toxic_parts="All parts",
        symptoms="Oral irritation, drooling, difficulty swallowing"
    ),
    "Euphorbia": ToxicityInfo(
        pet_friendly=False, toxicity_level="moderate",
        toxic_parts="Sap/latex",
        symptoms="Skin irritation, oral irritation, vomiting"
    ),
    "Euphorbia pulcherrima": ToxicityInfo(
        pet_friendly=False, toxicity_level="mild",
        toxic_parts="Sap/latex",
        symptoms="Mild oral irritation, drooling"
    ),
    "Kalanchoe": ToxicityInfo(
        pet_friendly=False, toxicity_level="moderate",
        toxic_parts="All parts",
        symptoms="Vomiting, diarrhea, heart arrhythmias"
    ),
    "Cyclamen": ToxicityInfo(
        pet_friendly=False, toxicity_level="moderate",
        toxic_parts="Roots/tubers",
        symptoms="Vomiting, diarrhea, heart rhythm abnormalities"
    ),
    "Hedera helix": ToxicityInfo(
        pet_friendly=False, toxicity_level="moderate",
        toxic_parts="All parts, especially berries",
        symptoms="Vomiting, diarrhea, abdominal pain"
    ),

    # Mild toxicity
    "Sansevieria": ToxicityInfo(
        pet_friendly=False, toxicity_level="mild",
        toxic_parts="All parts",
        symptoms="Nausea, vomiting, diarrhea"
    ),
    "Sansevieria trifasciata": ToxicityInfo(
        pet_friendly=False, toxicity_level="mild",
        toxic_parts="All parts",
        symptoms="Nausea, vomiting, diarrhea"
    ),
    "Dracaena": ToxicityInfo(
        pet_friendly=False, toxicity_level="mild",
        toxic_parts="All parts",
        symptoms="Vomiting, drooling, dilated pupils in cats"
    ),
    "Dracaena trifasciata": ToxicityInfo(
        pet_friendly=False, toxicity_level="mild",
        toxic_parts="All parts",
        symptoms="Nausea, vomiting, diarrhea"
    ),
    "Zamioculcas zamiifolia": ToxicityInfo(
        pet_friendly=False, toxicity_level="mild",
        toxic_parts="All parts",
        symptoms="Oral irritation, vomiting, diarrhea"
    ),
    "Aloe vera": ToxicityInfo(
        pet_friendly=False, toxicity_level="mild",
        toxic_parts="Gel and latex",
        symptoms="Vomiting, diarrhea, lethargy"
    ),
    "Aloe": ToxicityInfo(
        pet_friendly=False, toxicity_level="mild",
        toxic_parts="Gel and latex",
        symptoms="Vomiting, diarrhea, lethargy"
    ),
    "Crassula ovata": ToxicityInfo(
        pet_friendly=False, toxicity_level="mild",
        toxic_parts="All parts",
        symptoms="Vomiting, slow heart rate"
    ),
    "Ficus": ToxicityInfo(
        pet_friendly=False, toxicity_level="mild",
        toxic_parts="Sap/latex",
        symptoms="Oral irritation, drooling, vomiting"
    ),
    "Ficus elastica": ToxicityInfo(
        pet_friendly=False, toxicity_level="mild",
        toxic_parts="Sap/latex",
        symptoms="Oral irritation, drooling, vomiting"
    ),
    "Ficus lyrata": ToxicityInfo(
        pet_friendly=False, toxicity_level="mild",
        toxic_parts="Sap/latex",
        symptoms="Oral irritation, drooling, vomiting"
    ),
    "Ficus benjamina": ToxicityInfo(
        pet_friendly=False, toxicity_level="mild",
        toxic_parts="Sap/latex",
        symptoms="Oral irritation, drooling, vomiting"
    ),
    "Schefflera": ToxicityInfo(
        pet_friendly=False, toxicity_level="mild",
        toxic_parts="All parts",
        symptoms="Oral irritation, drooling, vomiting"
    ),
    "Asparagus setaceus": ToxicityInfo(
        pet_friendly=False, toxicity_level="mild",
        toxic_parts="Berries",
        symptoms="Vomiting, diarrhea, skin irritation"
    ),
    "Asparagus densiflorus": ToxicityInfo(
        pet_friendly=False, toxicity_level="mild",
        toxic_parts="Berries",
        symptoms="Vomiting, diarrhea, skin irritation"
    ),
    "Begonia": ToxicityInfo(
        pet_friendly=False, toxicity_level="mild",
        toxic_parts="All parts, especially tubers",
        symptoms="Oral irritation, vomiting"
    ),
    "Croton": ToxicityInfo(
        pet_friendly=False, toxicity_level="mild",
        toxic_parts="All parts",
        symptoms="Vomiting, diarrhea, skin irritation"
    ),
    "Codiaeum variegatum": ToxicityInfo(
        pet_friendly=False, toxicity_level="mild",
        toxic_parts="All parts",
        symptoms="Vomiting, diarrhea, skin irritation"
    ),

    # ============ SAFE PLANTS ============

    "Chlorophytum comosum": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Nephrolepis exaltata": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Chamaedorea elegans": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Dypsis lutescens": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Maranta leuconeura": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Calathea": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Goeppertia": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Peperomia": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Peperomia obtusifolia": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Saintpaulia": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Schlumbergera": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Phalaenopsis": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Orchidaceae": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Tillandsia": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Hypoestes phyllostachya": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Aspidistra elatior": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Pilea peperomioides": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Pilea": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Hoya": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Hoya carnosa": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Tradescantia zebrina": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Haworthia": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Echeveria": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Sempervivum": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Sedum": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Beaucarnea recurvata": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Ctenanthe": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Stromanthe": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Aeschynanthus": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Rhipsalis": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Opuntia": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Mammillaria": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Herbs": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Ocimum basilicum": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Rosmarinus officinalis": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Thymus vulgaris": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
    "Mentha": ToxicityInfo(
        pet_friendly=True, toxicity_level="safe",
        source="ASPCA"
    ),
}

# Common name aliases mapping to scientific names
COMMON_NAME_ALIASES: Dict[str, str] = {
    # Toxic plants
    "swiss cheese plant": "Monstera deliciosa",
    "monstera": "Monstera deliciosa",
    "split-leaf philodendron": "Monstera deliciosa",
    "pothos": "Epipremnum aureum",
    "devil's ivy": "Epipremnum aureum",
    "golden pothos": "Epipremnum aureum",
    "peace lily": "Spathiphyllum",
    "snake plant": "Sansevieria trifasciata",
    "mother-in-law's tongue": "Sansevieria trifasciata",
    "zz plant": "Zamioculcas zamiifolia",
    "aloe": "Aloe vera",
    "jade plant": "Crassula ovata",
    "rubber plant": "Ficus elastica",
    "rubber tree": "Ficus elastica",
    "fiddle leaf fig": "Ficus lyrata",
    "weeping fig": "Ficus benjamina",
    "dumb cane": "Dieffenbachia",
    "elephant ear": "Alocasia",
    "taro": "Colocasia",
    "calla lily": "Zantedeschia",
    "poinsettia": "Euphorbia pulcherrima",
    "english ivy": "Hedera helix",
    "ivy": "Hedera helix",
    "sago palm": "Cycas revoluta",
    "oleander": "Nerium oleander",
    "lily": "Lilium",
    "tulip": "Tulipa",
    "azalea": "Azalea",
    "rhododendron": "Rhododendron",
    "umbrella plant": "Schefflera",
    "croton": "Codiaeum variegatum",
    "asparagus fern": "Asparagus setaceus",
    "dragon tree": "Dracaena",
    "corn plant": "Dracaena",
    "flamingo flower": "Anthurium",
    "arrowhead plant": "Syngonium podophyllum",

    # Safe plants
    "spider plant": "Chlorophytum comosum",
    "boston fern": "Nephrolepis exaltata",
    "parlor palm": "Chamaedorea elegans",
    "areca palm": "Dypsis lutescens",
    "butterfly palm": "Dypsis lutescens",
    "prayer plant": "Maranta leuconeura",
    "calathea": "Calathea",
    "rattlesnake plant": "Calathea",
    "peperomia": "Peperomia",
    "african violet": "Saintpaulia",
    "christmas cactus": "Schlumbergera",
    "orchid": "Phalaenopsis",
    "moth orchid": "Phalaenopsis",
    "air plant": "Tillandsia",
    "polka dot plant": "Hypoestes phyllostachya",
    "cast iron plant": "Aspidistra elatior",
    "chinese money plant": "Pilea peperomioides",
    "pilea": "Pilea peperomioides",
    "wax plant": "Hoya carnosa",
    "hoya": "Hoya carnosa",
    "wandering jew": "Tradescantia zebrina",
    "zebra plant": "Haworthia",
    "haworthia": "Haworthia",
    "echeveria": "Echeveria",
    "hens and chicks": "Sempervivum",
    "stonecrop": "Sedum",
    "ponytail palm": "Beaucarnea recurvata",
    "lipstick plant": "Aeschynanthus",
    "mistletoe cactus": "Rhipsalis",
    "basil": "Ocimum basilicum",
    "rosemary": "Rosmarinus officinalis",
    "thyme": "Thymus vulgaris",
    "mint": "Mentha",
}


class PetToxicityService:
    """Service for looking up pet toxicity information for plants."""

    def _normalize_name(self, name: str) -> str:
        """Normalize a plant name for matching."""
        return name.lower().strip()

    def _lookup_in_database(
        self,
        species: Optional[str] = None,
        common_name: Optional[str] = None,
        genus: Optional[str] = None
    ) -> Optional[ToxicityInfo]:
        """Look up toxicity info in the local database."""

        # Try exact species match first
        if species:
            if species in TOXICITY_DATABASE:
                return TOXICITY_DATABASE[species]
            # Try normalized species
            for db_name, info in TOXICITY_DATABASE.items():
                if self._normalize_name(species) == self._normalize_name(db_name):
                    return info

        # Try common name lookup
        if common_name:
            normalized_common = self._normalize_name(common_name)
            if normalized_common in COMMON_NAME_ALIASES:
                scientific = COMMON_NAME_ALIASES[normalized_common]
                if scientific in TOXICITY_DATABASE:
                    return TOXICITY_DATABASE[scientific]
            # Partial match on common names
            for alias, scientific in COMMON_NAME_ALIASES.items():
                if alias in normalized_common or normalized_common in alias:
                    if scientific in TOXICITY_DATABASE:
                        return TOXICITY_DATABASE[scientific]

        # Try genus match as fallback
        if genus:
            if genus in TOXICITY_DATABASE:
                return TOXICITY_DATABASE[genus]
            for db_name, info in TOXICITY_DATABASE.items():
                if self._normalize_name(genus) == self._normalize_name(db_name):
                    return info

        # Try extracting genus from species name
        if species and " " in species:
            extracted_genus = species.split()[0]
            if extracted_genus in TOXICITY_DATABASE:
                return TOXICITY_DATABASE[extracted_genus]

        return None

    async def _search_web_for_toxicity(
        self,
        species: Optional[str] = None,
        common_name: Optional[str] = None
    ) -> Optional[ToxicityInfo]:
        """Search the web for toxicity information as a fallback."""
        search_term = species or common_name
        if not search_term:
            return None

        try:
            query = f"{search_term} toxic to cats dogs pets ASPCA"
            results = await google_search.search_plant_problem(query, num_results=5)

            if not results:
                return None

            # Analyze search results for toxicity indicators
            toxic_keywords = ["toxic", "poisonous", "harmful", "dangerous", "avoid"]
            safe_keywords = ["non-toxic", "safe", "pet-friendly", "not toxic", "harmless"]

            combined_text = " ".join([
                (r.get("title", "") + " " + r.get("snippet", "")).lower()
                for r in results
            ])

            toxic_score = sum(1 for kw in toxic_keywords if kw in combined_text)
            safe_score = sum(1 for kw in safe_keywords if kw in combined_text)

            if toxic_score > safe_score:
                return ToxicityInfo(
                    pet_friendly=False,
                    toxicity_level="unknown",
                    symptoms="Consult a veterinarian if ingested",
                    source="web_search"
                )
            elif safe_score > toxic_score:
                return ToxicityInfo(
                    pet_friendly=True,
                    toxicity_level="safe",
                    source="web_search"
                )

            return None

        except Exception as e:
            logger.error(f"Error searching for toxicity info: {e}")
            return None

    async def get_toxicity(
        self,
        species: Optional[str] = None,
        common_name: Optional[str] = None,
        genus: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Get pet toxicity information for a plant.

        Args:
            species: Scientific name of the plant
            common_name: Common name of the plant
            genus: Genus of the plant

        Returns:
            Dictionary with toxicity information or None if not found
        """
        # First try local database
        info = self._lookup_in_database(species, common_name, genus)

        # Fall back to web search if not in database
        if info is None:
            info = await self._search_web_for_toxicity(species, common_name)

        if info is None:
            return None

        return {
            "pet_friendly": info.pet_friendly,
            "toxicity_level": info.toxicity_level,
            "toxic_parts": info.toxic_parts,
            "symptoms": info.symptoms,
            "source": info.source,
        }


# Singleton instance
pet_toxicity_service = PetToxicityService()
