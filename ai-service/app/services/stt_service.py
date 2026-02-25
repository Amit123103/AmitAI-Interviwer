import openai
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

async def transcribe_audio(audio_file_path: str) -> str:
    if not openai.api_key:
        return "STT Error: OpenAI API Key missing (Placeholder text returned)"
        
    try:
        with open(audio_file_path, "rb") as audio_file:
            transcript = openai.Audio.transcribe("whisper-1", audio_file)
            return transcript.text
    except Exception as e:
        return f"STT Error: {str(e)}"
