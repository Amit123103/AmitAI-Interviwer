"""
Question Chain Service - Intelligent Multi-Turn Deep Dives

This service implements strategic question chaining to expose knowledge gaps.
Instead of random questions, it creates a logical progression from surface to depth.
"""

import json
from typing import Dict, List, Optional

class QuestionChainService:
    """
    Manages intelligent question chains that progressively test depth of knowledge.
    """
    
    def __init__(self, model_name: str):
        self.model_name = model_name
        
    def should_initiate_chain(self, topic: str, previous_score: int, move: str) -> bool:
        """
        Determines if we should start a question chain on a specific topic.
        
        Args:
            topic: The technical topic (e.g., "React Hooks", "Database Indexing")
            previous_score: Score from the last answer (0-10)
            move: Suggested move from ThinkingService
            
        Returns:
            True if we should start a deep-dive chain
        """
        # Start chain if:
        # 1. Score is medium (5-7) - they know something but not everything
        # 2. Move is DEEP_DIVE
        # 3. Topic is technical (not behavioral)
        
        if move == "DEEP_DIVE" and 5 <= previous_score <= 7:
            return True
        return False
    
    def generate_chain_plan(self, topic: str, initial_answer: str, profile: dict) -> Dict:
        """
        [DEPRECATED] Strategic chain planning is now handled by the Unified Turn Brain in main.py.
        """
        return None
    
    def get_next_chain_question(self, chain_plan: Dict, last_score: int) -> Optional[str]:
        """
        Gets the next question in the chain.
        
        Args:
            chain_plan: The chain plan from generate_chain_plan
            last_score: Score from the previous answer
            
        Returns:
            Next question string, or None if chain is complete
        """
        if not chain_plan:
            return None
        
        # Record the score
        chain_plan['scores'].append(last_score)
        
        # Move to next step
        current_step = chain_plan['current_step']
        questions = chain_plan.get('questions', [])
        
        if current_step >= len(questions):
            return None  # Chain complete
        
        next_question = questions[current_step]['question']
        chain_plan['current_step'] += 1
        
        return next_question
    
    def evaluate_chain_performance(self, chain_plan: Dict) -> Dict:
        """
        Evaluates overall performance across the entire chain.
        
        Args:
            chain_plan: Completed chain plan with scores
            
        Returns:
            Analysis of knowledge depth
        """
        scores = chain_plan.get('scores', [])
        
        if len(scores) < 3:
            return {"status": "incomplete"}
        
        surface_score = scores[0]
        application_score = scores[1]
        expert_score = scores[2]
        
        # Analyze pattern
        if surface_score >= 7 and application_score >= 7 and expert_score >= 7:
            depth = "Expert"
            feedback = f"Strong knowledge of {chain_plan['topic']} at all levels."
        elif surface_score >= 7 and application_score >= 6:
            depth = "Intermediate"
            feedback = f"Good fundamentals in {chain_plan['topic']}, but lacks expert-level understanding."
        elif surface_score >= 6:
            depth = "Beginner"
            feedback = f"Basic understanding of {chain_plan['topic']}, needs more practical experience."
        else:
            depth = "Weak"
            feedback = f"Foundational gaps in {chain_plan['topic']}. Recommend further study."
        
        return {
            "status": "complete",
            "topic": chain_plan['topic'],
            "depth_level": depth,
            "scores": {
                "surface": surface_score,
                "application": application_score,
                "expert": expert_score
            },
            "feedback": feedback
        }
