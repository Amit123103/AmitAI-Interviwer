"""
Integration tests for the AI Interviewer FastAPI service.
Run: pytest tests/ -v --tb=short
Requires: Ollama running locally with llama3.1:8b pulled.
"""

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.anyio


# ─────────── Health & Root ───────────────────────────────────────────

async def test_root_returns_200(client: AsyncClient):
    res = await client.get("/")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "online"


async def test_health_returns_200(client: AsyncClient):
    res = await client.get("/health")
    assert res.status_code == 200
    body = res.json()
    assert "status" in body
    assert "ollama" in body


# ─────────── Resume ──────────────────────────────────────────────────

async def test_resume_generate_questions(client: AsyncClient):
    """Generate questions from a resume text snippet."""
    payload = {
        "resume_text": "Experienced Python developer. Skills: Django, Flask, PostgreSQL, Redis, Docker, Kubernetes.",
        "count": 3,
        "difficulty": "Intermediate",
        "topic": "Backend"
    }
    res = await client.post("/resume/generate-questions", json=payload)
    assert res.status_code == 200
    body = res.json()
    # Should return a list of questions
    assert "questions" in body or isinstance(body, list)


# ─────────── Interview Evaluation ────────────────────────────────────

async def test_evaluate_answer(client: AsyncClient):
    """Evaluate a single interview answer."""
    payload = {
        "question": "Explain how a hash map works internally.",
        "answer": "A hash map uses a hash function to compute an index into an array of buckets. Each bucket holds key-value pairs. Collisions are resolved via chaining or open addressing.",
        "difficulty": "Intermediate",
        "sector": "General",
        "job_role": "Software Engineer"
    }
    res = await client.post("/interview/evaluate-answer", json=payload)
    assert res.status_code == 200
    body = res.json()
    assert "evaluation" in body or "metrics" in body


# ─────────── Report Generation ───────────────────────────────────────

async def test_generate_report(client: AsyncClient):
    """Generate a performance report from mock session data."""
    payload = {
        "evaluations": [
            {
                "question": "What is polymorphism?",
                "answer": "Polymorphism allows objects of different types to be treated as objects of a common super type.",
                "evaluation": {
                    "metrics": {
                        "relevance": 75,
                        "technical_correctness": 80,
                        "clarity_structure": 70,
                        "confidence": 65,
                        "communication": 72,
                        "concept_coverage": 68
                    }
                }
            }
        ],
        "transcript": [{"role": "user", "text": "Polymorphism allows..."}],
        "student_profile": {"fullName": "Test User"},
        "sector": "General",
        "target_company": "ACME Corp"
    }
    res = await client.post("/interview/generate-report", json=payload)
    assert res.status_code == 200
    body = res.json()
    assert "overall_score" in body or "error" in body


# ─────────── Speech Analysis ──────────────────────────────────────────

async def test_analyze_speech(client: AsyncClient):
    """Test the speech analysis aggregation endpoint."""
    payload = {
        "transcript_text": "Um, well, I think the, uh, main point is that polymorphism allows you to write generic code.",
        "duration_seconds": 30,
        "audio_features": {}
    }
    res = await client.post("/interview/analyze-speech", json=payload)
    assert res.status_code == 200
    body = res.json()
    assert "filler_words" in body or "confidence" in body


# ─────────── TTS ─────────────────────────────────────────────────────

async def test_speak_endpoint(client: AsyncClient):
    """Test text-to-speech endpoint returns audio."""
    payload = {
        "text": "Hello, welcome to your interview.",
        "persona": "Friendly Mentor"
    }
    res = await client.post("/speak", json=payload)
    assert res.status_code == 200
    body = res.json()
    assert "audio_base64" in body


# ─────────── STT ─────────────────────────────────────────────────────

async def test_stt_rejects_missing_file(client: AsyncClient):
    """STT endpoint should reject request without an audio file."""
    res = await client.post("/stt/transcribe")
    assert res.status_code in [400, 422]  # Validation error
