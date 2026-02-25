from fastapi import APIRouter, UploadFile, File, HTTPException
import whisper
import os
import tempfile
import shutil

router = APIRouter(prefix="/stt", tags=["STT"])
stt_model = None

def load_stt_model():
    global stt_model
    if stt_model is None:
        stt_model = whisper.load_model("tiny")
    return stt_model

@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    try:
        model = load_stt_model()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
            shutil.copyfileobj(file.file, temp_audio)
            temp_path = temp_audio.name
        
        result = model.transcribe(temp_path)
        os.unlink(temp_path)
        return {"transcript": result["text"]}
    except Exception as e:
        print(f"STT Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/transcribe-only")
async def transcribe_only(file: UploadFile = File(...)):
    """Similar to transcribe but potentially lighter or optimized for instant results."""
    return await transcribe(file)
