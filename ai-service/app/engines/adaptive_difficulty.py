"""
Adaptive Difficulty Engine
Dynamically adjusts interview question difficulty based on user performance
"""

from typing import Dict, List, Optional, Tuple
from datetime import datetime
import numpy as np


class AdaptiveDifficultyEngine:
    """
    Manages adaptive difficulty adjustment for interview questions
    """
    
    # Difficulty levels
    DIFFICULTY_LEVELS = ['easy', 'medium', 'hard', 'expert']
    
    # Performance thresholds for level adjustment
    LEVEL_UP_THRESHOLD = 0.75  # 75% performance to increase difficulty
    LEVEL_DOWN_THRESHOLD = 0.40  # Below 40% to decrease difficulty
    
    # Optimal performance range
    OPTIMAL_RANGE = (0.60, 0.80)
    
    def __init__(self):
        self.current_level = 'medium'  # Start at medium difficulty
        self.performance_history = []
        self.weak_areas = []
        self.strong_areas = []
    
    def calculate_current_level(self, performance_history: List[Dict]) -> str:
        """
        Calculate appropriate difficulty level based on performance history
        
        Args:
            performance_history: List of recent performance metrics
            
        Returns:
            Recommended difficulty level
        """
        if not performance_history:
            return 'medium'
        
        # Calculate average performance from recent attempts (last 5)
        recent_performance = performance_history[-5:]
        avg_score = np.mean([p['score'] for p in recent_performance])
        
        # Get current level index
        current_idx = self.DIFFICULTY_LEVELS.index(self.current_level)
        
        # Adjust level based on performance
        if avg_score >= self.LEVEL_UP_THRESHOLD and current_idx < len(self.DIFFICULTY_LEVELS) - 1:
            # Increase difficulty
            new_level = self.DIFFICULTY_LEVELS[current_idx + 1]
        elif avg_score < self.LEVEL_DOWN_THRESHOLD and current_idx > 0:
            # Decrease difficulty
            new_level = self.DIFFICULTY_LEVELS[current_idx - 1]
        else:
            # Maintain current level
            new_level = self.current_level
        
        self.current_level = new_level
        return new_level
    
    def select_next_question(
        self, 
        current_level: str, 
        topic: str, 
        weak_areas: List[str],
        question_pool: List[Dict]
    ) -> Optional[Dict]:
        """
        Select the next appropriate question based on difficulty and weak areas
        
        Args:
            current_level: Current difficulty level
            topic: Interview topic/sector
            weak_areas: List of identified weak areas
            question_pool: Available questions
            
        Returns:
            Selected question or None
        """
        # Filter questions by difficulty and topic
        candidates = [
            q for q in question_pool 
            if q.get('difficulty') == current_level and q.get('topic') == topic
        ]
        
        # Prioritize weak areas if any
        if weak_areas and candidates:
            weak_area_questions = [
                q for q in candidates 
                if any(area in q.get('skills', []) for area in weak_areas)
            ]
            if weak_area_questions:
                candidates = weak_area_questions
        
        # Return random question from candidates
        if candidates:
            return np.random.choice(candidates)
        
        return None
    
    def generate_follow_up(
        self, 
        answer_quality: float, 
        topic: str, 
        original_question: str
    ) -> Optional[str]:
        """
        Generate follow-up question based on answer quality
        
        Args:
            answer_quality: Quality score of the answer (0-1)
            topic: Question topic
            original_question: The original question asked
            
        Returns:
            Follow-up question or None
        """
        # If answer quality is low, probe for understanding
        if answer_quality < 0.5:
            follow_ups = [
                "Can you explain that in more detail?",
                "What specific approach would you take?",
                "Can you walk me through your thought process?",
                "What are the trade-offs of your solution?"
            ]
            return np.random.choice(follow_ups)
        
        # If answer quality is medium, ask for deeper insights
        elif answer_quality < 0.75:
            follow_ups = [
                "How would you optimize this solution?",
                "What edge cases should we consider?",
                "How would this scale in production?",
                "What alternatives did you consider?"
            ]
            return np.random.choice(follow_ups)
        
        # If answer quality is high, challenge with advanced scenarios
        else:
            follow_ups = [
                "How would you handle this at scale?",
                "What if we had constraint X?",
                "How would you monitor this in production?",
                "What metrics would you track?"
            ]
            return np.random.choice(follow_ups)
    
    def adjust_difficulty(self, response_metrics: Dict) -> Tuple[str, str]:
        """
        Adjust difficulty based on response metrics
        
        Args:
            response_metrics: Dictionary containing performance metrics
            
        Returns:
            Tuple of (new_level, reasoning)
        """
        score = response_metrics.get('overall_score', 0)
        confidence = response_metrics.get('confidence', 0)
        speed = response_metrics.get('response_speed', 0)
        
        # Calculate weighted performance
        weighted_score = (score * 0.5) + (confidence * 0.3) + (speed * 0.2)
        
        # Add to history
        self.performance_history.append({
            'score': weighted_score,
            'timestamp': datetime.now(),
            'metrics': response_metrics
        })
        
        # Calculate new level
        new_level = self.calculate_current_level(self.performance_history)
        
        # Generate reasoning
        if new_level != self.current_level:
            direction = "increased" if self.DIFFICULTY_LEVELS.index(new_level) > self.DIFFICULTY_LEVELS.index(self.current_level) else "decreased"
            reasoning = f"Difficulty {direction} based on consistent performance at {weighted_score:.2%}"
        else:
            reasoning = f"Maintaining {new_level} difficulty - performance in optimal range"
        
        return new_level, reasoning
    
    def identify_weak_areas(self, performance_by_skill: Dict[str, List[float]]) -> List[str]:
        """
        Identify weak areas based on skill-specific performance
        
        Args:
            performance_by_skill: Dictionary mapping skills to performance scores
            
        Returns:
            List of weak skill areas
        """
        weak_threshold = 0.60
        weak_areas = []
        
        for skill, scores in performance_by_skill.items():
            if scores:
                avg_score = np.mean(scores)
                if avg_score < weak_threshold:
                    weak_areas.append(skill)
        
        self.weak_areas = weak_areas
        return weak_areas
    
    def identify_strong_areas(self, performance_by_skill: Dict[str, List[float]]) -> List[str]:
        """
        Identify strong areas based on skill-specific performance
        
        Args:
            performance_by_skill: Dictionary mapping skills to performance scores
            
        Returns:
            List of strong skill areas
        """
        strong_threshold = 0.80
        strong_areas = []
        
        for skill, scores in performance_by_skill.items():
            if scores:
                avg_score = np.mean(scores)
                if avg_score >= strong_threshold:
                    strong_areas.append(skill)
        
        self.strong_areas = strong_areas
        return strong_areas
    
    def get_performance_summary(self) -> Dict:
        """
        Get summary of current performance and difficulty status
        
        Returns:
            Performance summary dictionary
        """
        if not self.performance_history:
            return {
                'current_level': self.current_level,
                'avg_performance': 0,
                'trend': 'stable',
                'weak_areas': [],
                'strong_areas': []
            }
        
        recent = self.performance_history[-10:]
        avg_performance = np.mean([p['score'] for p in recent])
        
        # Calculate trend
        if len(recent) >= 3:
            first_half = np.mean([p['score'] for p in recent[:len(recent)//2]])
            second_half = np.mean([p['score'] for p in recent[len(recent)//2:]])
            
            if second_half > first_half + 0.1:
                trend = 'improving'
            elif second_half < first_half - 0.1:
                trend = 'declining'
            else:
                trend = 'stable'
        else:
            trend = 'stable'
        
        return {
            'current_level': self.current_level,
            'avg_performance': avg_performance,
            'trend': trend,
            'weak_areas': self.weak_areas,
            'strong_areas': self.strong_areas,
            'total_attempts': len(self.performance_history)
        }
