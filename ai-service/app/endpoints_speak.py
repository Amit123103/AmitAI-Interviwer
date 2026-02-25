# Add this after the HintRequest endpoint (around line 70)

class SpeakRequest(BaseModel):
    text: str
    persona: str = "Friendly Mentor"

@app.post("/speak")
async def speak(request: SpeakRequest):
    """
    Converts text to speech using Edge TTS.
    """
    try:
        # Map persona to voice
        voice = "en-US-EmmaNeural" if request.persona == "Friendly Mentor" else "en-GB-RyanNeural"
        
        # Generate TTS
        communicate = edge_tts.Communicate(request.text, voice)
        mp3_fp = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                mp3_fp.write(chunk["data"])
        
        # Encode to base64
        audio_base64 = base64.b64encode(mp3_fp.getvalue()).decode('utf-8')
        
        return {
            "audio_base64": audio_base64,
            "text": request.text
        }
    except Exception as e:
        print(f"Error in /speak: {e}")
        raise HTTPException(status_code=500, detail=str(e))
