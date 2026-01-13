"""Image-based plant diagnosis using OpenAI Vision API."""
import base64
import httpx
from pathlib import Path
from typing import List, Dict, Optional
from app.config import settings
from app.utils.logging_config import get_logger

logger = get_logger(__name__)


class ImageDiagnosisService:
    """Service for analyzing plant images to diagnose problems."""

    def __init__(self):
        self.api_key = getattr(settings, 'OPENAI_API_KEY', None)
        self.base_url = "https://api.openai.com/v1/chat/completions"

    def _encode_image_to_base64(self, image_path: str) -> Optional[str]:
        """Convert image file to base64 string."""
        try:
            # Handle relative paths from uploads directory
            if not image_path.startswith('/'):
                image_path = Path(settings.UPLOAD_DIR).parent.parent / image_path.lstrip('/')

            with open(image_path, "rb") as image_file:
                return base64.standard_b64encode(image_file.read()).decode("utf-8")
        except Exception as e:
            logger.error(f"Error encoding image: {e}")
            return None

    async def analyze_plant_image(
        self,
        image_path: str,
        plant_name: str,
        user_description: str
    ) -> List[Dict[str, str]]:
        """
        Analyze a plant image to diagnose problems.

        Args:
            image_path: Path to the plant image
            plant_name: Name of the plant
            user_description: User's description of the problem

        Returns:
            List of diagnosis results with title and detailed advice
        """
        # Check if API key is configured
        if not self.api_key:
            logger.info("OpenAI API key not configured, using fallback diagnosis")
            return self._get_fallback_diagnosis(plant_name, user_description)

        # Encode image
        base64_image = self._encode_image_to_base64(image_path)
        if not base64_image:
            return self._get_fallback_diagnosis(plant_name, user_description)

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.base_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gpt-4o",
                        "messages": [
                            {
                                "role": "system",
                                "content": """You are an expert plant pathologist and horticulturist.
Analyze the plant image and provide a diagnosis. Be specific about what you see in the image.
Format your response as exactly 3-4 numbered tips, each with a TITLE and ADVICE.
Format:
1. **TITLE**: Advice text here
2. **TITLE**: Advice text here
etc."""
                            },
                            {
                                "role": "user",
                                "content": [
                                    {
                                        "type": "text",
                                        "text": f"This is a {plant_name}. The owner says: '{user_description}'. Please analyze this plant image and tell me: 1) What problems do you see? 2) What's causing them? 3) How to fix them?"
                                    },
                                    {
                                        "type": "image_url",
                                        "image_url": {
                                            "url": f"data:image/jpeg;base64,{base64_image}"
                                        }
                                    }
                                ]
                            }
                        ],
                        "max_tokens": 1000
                    },
                    timeout=30.0
                )

                response.raise_for_status()
                data = response.json()

                # Parse the response
                content = data['choices'][0]['message']['content']
                return self._parse_diagnosis_response(content)

        except Exception as e:
            logger.error(f"OpenAI Vision API error: {e}")
            return self._get_fallback_diagnosis(plant_name, user_description)

    def _parse_diagnosis_response(self, content: str) -> List[Dict[str, str]]:
        """Parse the AI response into structured diagnosis results."""
        results = []
        lines = content.strip().split('\n')

        current_title = ""
        current_snippet = ""
        rank = 0

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Check for numbered items with bold titles
            # Pattern: "1. **Title**: advice" or "1. **Title** - advice"
            import re
            match = re.match(r'^\d+\.\s*\*\*(.+?)\*\*[:\-]?\s*(.*)$', line)

            if match:
                # Save previous item if exists
                if current_title and current_snippet:
                    rank += 1
                    results.append({
                        'title': current_title.strip(),
                        'snippet': current_snippet.strip(),
                        'url': '',
                        'rank': rank
                    })

                current_title = match.group(1)
                current_snippet = match.group(2)
            elif current_title:
                # Continue previous snippet
                current_snippet += " " + line

        # Don't forget the last item
        if current_title and current_snippet:
            rank += 1
            results.append({
                'title': current_title.strip(),
                'snippet': current_snippet.strip(),
                'url': '',
                'rank': rank
            })

        # If parsing failed, return the whole response as one item
        if not results:
            results.append({
                'title': 'Plant Analysis',
                'snippet': content[:500] if len(content) > 500 else content,
                'url': '',
                'rank': 1
            })

        return results

    def _get_fallback_diagnosis(self, plant_name: str, description: str) -> List[Dict[str, str]]:
        """Provide fallback diagnosis when API is not available."""
        description_lower = description.lower()

        # Basic keyword matching for fallback
        results = []

        if any(word in description_lower for word in ['dying', 'dead', 'sick']):
            results.extend([
                {
                    'title': 'Check for Root Problems',
                    'snippet': f'For a sick {plant_name}, gently remove from pot and inspect roots. Healthy roots are white/tan. Brown, mushy roots indicate rot - trim and repot in fresh soil.',
                    'url': '',
                    'rank': 1
                },
                {
                    'title': 'Review Watering Schedule',
                    'snippet': 'Most plant problems stem from incorrect watering. Check soil moisture before watering - only water when the top 1-2 inches are dry.',
                    'url': '',
                    'rank': 2
                },
                {
                    'title': 'Assess Light and Location',
                    'snippet': f'Ensure your {plant_name} is getting appropriate light. Most houseplants prefer bright, indirect light. Too little causes weak growth, too much can burn leaves.',
                    'url': '',
                    'rank': 3
                },
            ])
        elif any(word in description_lower for word in ['yellow', 'yellowing']):
            results.extend([
                {
                    'title': 'Likely Overwatering',
                    'snippet': f'Yellow leaves on {plant_name} often indicate overwatering. Let soil dry out between waterings and ensure pot has drainage holes.',
                    'url': '',
                    'rank': 1
                },
                {
                    'title': 'Check for Nutrient Deficiency',
                    'snippet': 'If older/lower leaves yellow first, the plant may need fertilizer. Feed with balanced liquid fertilizer during growing season.',
                    'url': '',
                    'rank': 2
                },
            ])
        elif any(word in description_lower for word in ['brown', 'browning', 'crispy']):
            results.extend([
                {
                    'title': 'Humidity Too Low',
                    'snippet': f'Brown, crispy leaf edges on {plant_name} typically mean low humidity. Mist regularly, use a pebble tray, or add a humidifier nearby.',
                    'url': '',
                    'rank': 1
                },
                {
                    'title': 'Possible Sunburn',
                    'snippet': 'Brown patches on leaves facing light suggest sunburn. Move plant away from direct sun or filter with a sheer curtain.',
                    'url': '',
                    'rank': 2
                },
            ])
        elif any(word in description_lower for word in ['droop', 'drooping', 'wilt', 'wilting']):
            results.extend([
                {
                    'title': 'Check Soil Moisture',
                    'snippet': f'Drooping {plant_name} usually means water stress. Stick finger in soil - if dry, water thoroughly. If wet, check for root rot.',
                    'url': '',
                    'rank': 1
                },
                {
                    'title': 'Temperature Stress',
                    'snippet': 'Plants near cold drafts, AC vents, or heaters may droop. Move to a more stable temperature location.',
                    'url': '',
                    'rank': 2
                },
            ])
        else:
            # Generic advice
            results.extend([
                {
                    'title': f'General Care Check for {plant_name}',
                    'snippet': 'Examine your plant carefully: Check soil moisture, inspect leaves (top and bottom) for pests, and ensure adequate light. Most problems are watering-related.',
                    'url': '',
                    'rank': 1
                },
                {
                    'title': 'Common Issues to Rule Out',
                    'snippet': 'Look for: yellowing (overwatering), brown tips (low humidity), drooping (water stress), spots (disease/pests), leggy growth (insufficient light).',
                    'url': '',
                    'rank': 2
                },
                {
                    'title': 'When in Doubt, Check the Roots',
                    'snippet': 'Many plant problems start at the roots. Gently unpot and look for healthy white roots vs. brown mushy ones indicating rot.',
                    'url': '',
                    'rank': 3
                },
            ])

        return results


# Singleton instance
image_diagnosis = ImageDiagnosisService()
