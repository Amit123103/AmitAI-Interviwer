"""
Performance Scorer
Evaluates interview responses across multiple dimensions
"""

from typing import Dict, List, Optional
import re
from datetime import datetime


class PerformanceScorer:
    """
    Scores interview performance across multiple metrics
    """
    
    # Keywords that indicate strong technical responses
    TECHNICAL_KEYWORDS = {
        'algorithm', 'complexity', 'optimization', 'scalability', 'performance',
        'data structure', 'time complexity', 'space complexity', 'trade-off',
        'implementation', 'architecture', 'design pattern', 'best practice'
    }
    
    # STAR method indicators
    STAR_INDICATORS = {
        'situation': ['when', 'where', 'context', 'background', 'scenario'],
        'task': ['responsible', 'role', 'objective', 'goal', 'challenge'],
        'action': ['did', 'implemented', 'developed', 'created', 'solved'],
        'result': ['achieved', 'improved', 'increased', 'reduced', 'outcome']
    }
    
    def __init__(self):
        self.scoring_history = []
    
    def score_response_quality(
        self, 
        answer: str, 
        expected_keywords: List[str],
        question_type: str = 'technical'
    ) -> Dict[str, float]:
        """
        Score the quality of a response
        
        Args:
            answer: The candidate's answer
            expected_keywords: Keywords expected in a good answer
            question_type: Type of question (technical, behavioral, etc.)
            
        Returns:
            Dictionary of quality scores
        """
        answer_lower = answer.lower()
        words = answer_lower.split()
        
        # 1. Keyword Coverage Score (0-100)
        if expected_keywords:
            keyword_matches = sum(1 for kw in expected_keywords if kw.lower() in answer_lower)
            keyword_score = min(100, (keyword_matches / len(expected_keywords)) * 100)
        else:
            keyword_score = 50  # Neutral score if no keywords provided
        
        # 2. Technical Depth Score (0-100)
        technical_matches = sum(1 for kw in self.TECHNICAL_KEYWORDS if kw in answer_lower)
        technical_score = min(100, technical_matches * 15)  # Cap at 100
        
        # 3. Response Length Score (0-100)
        word_count = len(words)
        if word_count < 20:
            length_score = 30  # Too short
        elif word_count < 50:
            length_score = 60  # Adequate
        elif word_count < 150:
            length_score = 100  # Ideal
        elif word_count < 300:
            length_score = 85  # Good but verbose
        else:
            length_score = 70  # Too verbose
        
        # 4. Structure Score (0-100) - Check for clear structure
        has_intro = any(word in answer_lower[:100] for word in ['first', 'initially', 'start', 'begin'])
        has_body = len(words) > 30
        has_conclusion = any(word in answer_lower[-100:] for word in ['therefore', 'conclusion', 'summary', 'finally'])
        structure_score = (has_intro * 33 + has_body * 34 + has_conclusion * 33)
        
        # 5. STAR Method Score (for behavioral questions)
        star_score = self._calculate_star_score(answer_lower) if question_type == 'behavioral' else 0
        
        # Calculate overall quality score
        if question_type == 'technical':
            overall_score = (
                keyword_score * 0.35 +
                technical_score * 0.30 +
                length_score * 0.20 +
                structure_score * 0.15
            )
        elif question_type == 'behavioral':
            overall_score = (
                keyword_score * 0.25 +
                star_score * 0.40 +
                length_score * 0.20 +
                structure_score * 0.15
            )
        else:
            overall_score = (
                keyword_score * 0.40 +
                length_score * 0.30 +
                structure_score * 0.30
            )
        
        return {
            'overall_score': overall_score / 100,  # Normalize to 0-1
            'keyword_score': keyword_score / 100,
            'technical_score': technical_score / 100,
            'length_score': length_score / 100,
            'structure_score': structure_score / 100,
            'star_score': star_score / 100 if question_type == 'behavioral' else None
        }
    
    def _calculate_star_score(self, answer: str) -> float:
        """Calculate STAR method adherence score"""
        scores = {}
        
        for component, indicators in self.STAR_INDICATORS.items():
            matches = sum(1 for indicator in indicators if indicator in answer)
            scores[component] = min(100, matches * 30)  # Max 100 per component
        
        # Average across all STAR components
        return sum(scores.values()) / len(scores)
    
    def calculate_confidence_level(self, audio_features: Dict) -> float:
        """
        Calculate confidence level from audio features
        
        Args:
            audio_features: Dictionary containing audio analysis data
            
        Returns:
            Confidence score (0-1)
        """
        # Extract features
        volume = audio_features.get('average_volume', 0.5)
        pace = audio_features.get('speaking_pace', 150)  # words per minute
        filler_rate = audio_features.get('filler_rate', 0)
        pause_frequency = audio_features.get('pause_frequency', 0)
        
        # Score each feature
        # 1. Volume score (optimal range: 0.4-0.8)
        if 0.4 <= volume <= 0.8:
            volume_score = 100
        elif volume < 0.4:
            volume_score = max(0, volume * 250)  # Too quiet
        else:
            volume_score = max(0, 100 - (volume - 0.8) * 200)  # Too loud
        
        # 2. Pace score (optimal: 140-160 wpm)
        if 140 <= pace <= 160:
            pace_score = 100
        elif pace < 140:
            pace_score = max(0, (pace / 140) * 100)  # Too slow
        else:
            pace_score = max(0, 100 - ((pace - 160) / 2))  # Too fast
        
        # 3. Filler score (lower is better)
        filler_score = max(0, 100 - (filler_rate * 500))
        
        # 4. Pause score (moderate pauses are good)
        if 0.1 <= pause_frequency <= 0.3:
            pause_score = 100
        else:
            pause_score = max(0, 100 - abs(pause_frequency - 0.2) * 200)
        
        # Weighted confidence score
        confidence = (
            volume_score * 0.25 +
            pace_score * 0.30 +
            filler_score * 0.30 +
            pause_score * 0.15
        ) / 100
        
        return min(1.0, max(0.0, confidence))
    
    def measure_response_speed(
        self, 
        time_taken: float, 
        question_complexity: str = 'medium'
    ) -> Dict[str, any]:
        """
        Measure response speed and efficiency
        
        Args:
            time_taken: Time taken to answer in seconds
            question_complexity: Complexity level of the question
            
        Returns:
            Speed metrics dictionary
        """
        # Expected time ranges by complexity (in seconds)
        expected_times = {
            'easy': (15, 45),
            'medium': (30, 90),
            'hard': (60, 180),
            'expert': (90, 240)
        }
        
        min_time, max_time = expected_times.get(question_complexity, (30, 90))
        optimal_time = (min_time + max_time) / 2
        
        # Calculate speed score
        if time_taken < min_time:
            speed_score = 0.7  # Too fast, might be superficial
            feedback = "Response was very quick. Consider elaborating more."
        elif min_time <= time_taken <= max_time:
            # Optimal range
            deviation = abs(time_taken - optimal_time) / optimal_time
            speed_score = 1.0 - (deviation * 0.3)
            feedback = "Good response time."
        else:
            # Too slow
            overtime = time_taken - max_time
            speed_score = max(0.3, 1.0 - (overtime / max_time))
            feedback = "Response took longer than expected. Try to be more concise."
        
        return {
            'speed_score': speed_score,
            'time_taken': time_taken,
            'expected_range': (min_time, max_time),
            'feedback': feedback
        }
    
    def detect_weak_areas(
        self, 
        answer_content: str, 
        topic: str,
        expected_concepts: List[str]
    ) -> List[str]:
        """
        Detect weak areas based on missing concepts
        
        Args:
            answer_content: The answer text
            topic: Topic/sector of the question
            expected_concepts: Concepts that should be covered
            
        Returns:
            List of weak/missing areas
        """
        answer_lower = answer_content.lower()
        weak_areas = []
        
        for concept in expected_concepts:
            if concept.lower() not in answer_lower:
                weak_areas.append(concept)
        
        return weak_areas
    
    def generate_comprehensive_score(
        self,
        response_quality: Dict,
        confidence_level: float,
        response_speed: Dict,
        weak_areas: List[str]
    ) -> Dict:
        """
        Generate comprehensive performance score
        
        Args:
            response_quality: Quality scores
            confidence_level: Confidence score
            response_speed: Speed metrics
            weak_areas: Identified weak areas
            
        Returns:
            Comprehensive score dictionary
        """
        # Calculate weighted overall score
        overall_score = (
            response_quality['overall_score'] * 0.50 +
            confidence_level * 0.30 +
            response_speed['speed_score'] * 0.20
        )
        
        # Determine performance level
        if overall_score >= 0.85:
            level = 'excellent'
        elif overall_score >= 0.70:
            level = 'good'
        elif overall_score >= 0.55:
            level = 'average'
        else:
            level = 'needs_improvement'
        
        # Generate feedback
        feedback = self._generate_feedback(
            overall_score,
            response_quality,
            confidence_level,
            response_speed,
            weak_areas
        )
        
        score_data = {
            'overall_score': overall_score,
            'performance_level': level,
            'breakdown': {
                'response_quality': response_quality['overall_score'],
                'confidence': confidence_level,
                'speed': response_speed['speed_score']
            },
            'weak_areas': weak_areas,
            'feedback': feedback,
            'timestamp': datetime.now().isoformat()
        }
        
        self.scoring_history.append(score_data)
        return score_data
    
    def _generate_feedback(
        self,
        overall_score: float,
        quality: Dict,
        confidence: float,
        speed: Dict,
        weak_areas: List[str]
    ) -> List[str]:
        """Generate actionable feedback"""
        feedback = []
        
        # Quality feedback
        if quality['overall_score'] < 0.6:
            feedback.append("Try to provide more detailed and structured answers.")
        if quality.get('technical_score', 0) < 0.5:
            feedback.append("Include more technical details and terminology.")
        if quality.get('star_score') is not None and quality['star_score'] < 0.6:
            feedback.append("Use the STAR method: Situation, Task, Action, Result.")
        
        # Confidence feedback
        if confidence < 0.6:
            feedback.append("Speak with more confidence and clarity.")
        
        # Speed feedback
        feedback.append(speed['feedback'])
        
        # Weak areas
        if weak_areas:
            feedback.append(f"Consider reviewing: {', '.join(weak_areas[:3])}")
        
        return feedback
