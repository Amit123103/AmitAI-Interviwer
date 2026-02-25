import edge_tts
import io
import base64
from typing import Dict, Any

class TTSService:
    """Natural Text-to-Speech service using Edge TTS with offline capabilities."""
    
    def __init__(self):
        self.cache = {} # Simple in-memory cache for common phrases

    PERSONA_VOICES = {
        "Friendly Mentor": "en-US-EmmaNeural",
        "Strict Lead": "en-GB-RyanNeural",
        "Stress Tester": "en-US-GuyNeural",
        "HR Manager": "en-US-AndrewNeural"
    }

    async def speak(self, text: str, persona: str = "Friendly Mentor") -> str:
        """
        Converts text to speech and returns base64 encoded audio.
        """
        cache_key = f"{persona}:{text}"
        if cache_key in self.cache:
            return self.cache[cache_key]

        voice = self.PERSONA_VOICES.get(persona, "en-US-EmmaNeural")
        try:
            communicate = edge_tts.Communicate(text, voice)
            mp3_fp = io.BytesIO()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    mp3_fp.write(chunk["data"])
            
            result = base64.b64encode(mp3_fp.getvalue()).decode('utf-8')
            # Limit cache size to 100 items
            if len(self.cache) < 100:
                self.cache[cache_key] = result
            return result
        except Exception as e:
            print(f"TTS Error: {e}")
            return ""

# Singleton instance
tts_service = TTSService()
