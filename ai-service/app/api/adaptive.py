"""
Adaptive Interview API Endpoints
Provides endpoints for adaptive difficulty and real-time feedback
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

from app.engines.adaptive_difficulty import AdaptiveDifficultyEngine
from app.engines.performance_scorer import PerformanceScorer
from app.analyzers.speech_analyzer import SpeechAnalyzer

router = APIRouter(prefix="/adaptive", tags=["adaptive"])

# Initialize engines (in production, these would be session-specific)
difficulty_engines = {}
performance_scorers = {}
speech_analyzers = {}


# Request/Response Models
class PerformanceMetrics(BaseModel):
    overall_score: float
    confidence: float
    response_speed: float
    weak_areas: List[str] = []


class NextQuestionRequest(BaseModel):
    user_id: str
    session_id: str
    topic: str
    performance_history: List[Dict]
    weak_areas: List[str] = []


class ScoreResponseRequest(BaseModel):
    user_id: str
    session_id: str
    answer: str
    question_id: str
    question_type: str = "technical"
    expected_keywords: List[str] = []
    expected_concepts: List[str] = []
    duration_seconds: float
    audio_features: Dict


class RealTimeFeedbackRequest(BaseModel):
    session_id: str
    transcript: str
    duration: float
    audio_features: Dict


def get_difficulty_engine(session_id: str) -> AdaptiveDifficultyEngine:
    """Get or create difficulty engine for session"""
    if session_id not in difficulty_engines:
        difficulty_engines[session_id] = AdaptiveDifficultyEngine()
    return difficulty_engines[session_id]


def get_performance_scorer(session_id: str) -> PerformanceScorer:
    """Get or create performance scorer for session"""
    if session_id not in performance_scorers:
        performance_scorers[session_id] = PerformanceScorer()
    return performance_scorers[session_id]


def get_speech_analyzer(session_id: str) -> SpeechAnalyzer:
    """Get or create speech analyzer for session"""
    if session_id not in speech_analyzers:
        speech_analyzers[session_id] = SpeechAnalyzer()
    return speech_analyzers[session_id]


@router.post("/next-question")
async def get_next_question(request: NextQuestionRequest):
    """
    Get next adaptive question based on performance
    """
    try:
        engine = get_difficulty_engine(request.session_id)
        
        # Calculate current difficulty level
        current_level = engine.calculate_current_level(request.performance_history)
        
        # Mock question pool (in production, fetch from database)
        question_pool = [
            {
                "id": "q1",
                "difficulty": "easy",
                "topic": request.topic,
                "question": "What is a REST API?",
                "skills": ["api", "web"]
            },
            {
                "id": "q2",
                "difficulty": "medium",
                "topic": request.topic,
                "question": "Explain the difference between SQL and NoSQL databases.",
                "skills": ["database", "architecture"]
            },
            {
                "id": "q3",
                "difficulty": "hard",
                "topic": request.topic,
                "question": "How would you design a distributed caching system?",
                "skills": ["system design", "scalability"]
            }
        ]
        
        # Select next question
        next_question = engine.select_next_question(
            current_level,
            request.topic,
            request.weak_areas,
            question_pool
        )
        
        if not next_question:
            raise HTTPException(status_code=404, detail="No suitable question found")
        
        return {
            "question": next_question,
            "difficulty": current_level,
            "reasoning": f"Selected {current_level} question based on performance",
            "performance_summary": engine.get_performance_summary()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/score-response")
async def score_response(request: ScoreResponseRequest):
    """
    Score a response and provide adaptive feedback
    """
    try:
        scorer = get_performance_scorer(request.session_id)
        engine = get_difficulty_engine(request.session_id)
        
        # Score response quality
        quality_scores = scorer.score_response_quality(
            request.answer,
            request.expected_keywords,
            request.question_type
        )
        
        # Calculate confidence from audio
        confidence_score = scorer.calculate_confidence_level(request.audio_features)
        
        # Measure response speed
        speed_metrics = scorer.measure_response_speed(
            request.duration_seconds,
            engine.current_level
        )
        
        # Detect weak areas
        weak_areas = scorer.detect_weak_areas(
            request.answer,
            request.question_type,
            request.expected_concepts
        )
        
        # Generate comprehensive score
        comprehensive_score = scorer.generate_comprehensive_score(
            quality_scores,
            confidence_score,
            speed_metrics,
            weak_areas
        )
        
        # Adjust difficulty for next question
        response_metrics = {
            'overall_score': comprehensive_score['overall_score'],
            'confidence': confidence_score,
            'response_speed': speed_metrics['speed_score']
        }
        
        new_level, reasoning = engine.adjust_difficulty(response_metrics)
        
        # Generate follow-up if needed
        follow_up = None
        if quality_scores['overall_score'] < 0.75:
            follow_up = engine.generate_follow_up(
                quality_scores['overall_score'],
                request.question_type,
                ""  # Would pass actual question here
            )
        
        return {
            "scores": comprehensive_score,
            "next_difficulty": new_level,
            "difficulty_reasoning": reasoning,
            "follow_up_question": follow_up,
            "weak_areas": weak_areas
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/realtime-feedback")
async def get_realtime_feedback(request: RealTimeFeedbackRequest):
    """
    Get real-time speech feedback
    """
    try:
        analyzer = get_speech_analyzer(request.session_id)
        
        # Generate comprehensive real-time feedback
        feedback = analyzer.generate_real_time_feedback(
            request.transcript,
            request.duration,
            request.audio_features
        )
        
        return feedback
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/performance-summary/{session_id}")
async def get_performance_summary(session_id: str):
    """
    Get performance summary for a session
    """
    try:
        engine = get_difficulty_engine(session_id)
        scorer = get_performance_scorer(session_id)
        
        return {
            "difficulty_summary": engine.get_performance_summary(),
            "scoring_history": scorer.scoring_history[-10:],  # Last 10 scores
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/session/{session_id}")
async def cleanup_session(session_id: str):
    """
    Clean up session data
    """
    try:
        if session_id in difficulty_engines:
            del difficulty_engines[session_id]
        if session_id in performance_scorers:
            del performance_scorers[session_id]
        if session_id in speech_analyzers:
            del speech_analyzers[session_id]
        
        return {"message": "Session cleaned up successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
