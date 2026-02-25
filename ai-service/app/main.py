from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os
import time
import threading
import ollama
import whisper
from dotenv import load_dotenv

# Import modular routers
from app.api.resume import router as resume_router
from app.api.interview import router as interview_router
from app.api.onsite import router as onsite_router
from app.api.speak import router as speak_router
from app.api.stt import router as stt_router
from app.api.negotiation import router as negotiation_router
from app.api.technical import router as technical_router
from app.api.adaptive import router as adaptive_router
from app.endpoints_coding import router as coding_router

load_dotenv()

# Prioritize MODEL_NAME, fallback to OLLAMA_MODEL, then default
MODEL_NAME = os.getenv("MODEL_NAME") or os.getenv("OLLAMA_MODEL") or "llama3.1:8b"
_ollama_ready = False  # Set by warmup thread

@asynccontextmanager
async def lifespan(app: FastAPI):
    global _ollama_ready
    # Startup: Warm up models
    print(f"Starting up AI Service with model: {MODEL_NAME}")
    
    def warmup():
        global _ollama_ready
        try:
            print("Warming up Ollama...")
            ollama.chat(model=MODEL_NAME, messages=[{"role": "user", "content": "hi"}], options={"num_predict": 5})
            _ollama_ready = True
            print("Ollama ready.")
        except Exception as e:
            print(f"Ollama warmup failed: {e}")

    threading.Thread(target=warmup, daemon=True).start()
    yield
    print("Shutting down AI Service...")

app = FastAPI(title="AI Interviewer Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(resume_router)
app.include_router(interview_router)
app.include_router(onsite_router)
app.include_router(speak_router)
app.include_router(stt_router)
app.include_router(negotiation_router)
app.include_router(technical_router)
app.include_router(adaptive_router)
app.include_router(coding_router)

@app.get("/")
async def root():
    return {
        "message": "AI Interviewer Service is running",
        "version": "2.0.0",
        "status": "online"
    }

@app.get("/health")
async def health():
    """Lightweight health ping — no Ollama call. Used by Node server polling."""
    return {
        "status": "healthy",
        "model": MODEL_NAME,
        "ollama": "ready" if _ollama_ready else "warming_up",
        "timestamp": time.time()
    }

@app.get("/health/deep")
async def health_deep():
    """Deep health check — actually pings Ollama. Use sparingly."""
    ollama_status = "unknown"
    try:
        ollama.chat(model=MODEL_NAME, messages=[{"role": "user", "content": "hi"}], options={"num_predict": 1})
        ollama_status = "online"
    except Exception as e:
        ollama_status = f"offline: {str(e)}"

    return {
        "status": "healthy" if "offline" not in ollama_status else "degraded",
        "model": MODEL_NAME,
        "ollama": ollama_status,
        "timestamp": time.time()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

