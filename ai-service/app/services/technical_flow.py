from typing import List, Dict, Optional
import math

class TechnicalFlowManager:
    """
    Manages specialized technical coding interview logic.
    Scales difficulty based on solving speed, correctness, and pre-selected level.
    """
    
    DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"]
    
    def __init__(self, coding_level: str = "Intermediate", department: str = "General"):
        self.coding_level = coding_level if coding_level in self.DIFFICULTY_LEVELS else "Intermediate"
        self.department = department
        self.difficulty_score = self._get_initial_score(self.coding_level) # 0.0 to 1.0
        self.history: List[Dict] = []
        
    def _get_initial_score(self, level: str) -> float:
        if level == "Beginner": return 0.2
        if level == "Intermediate": return 0.5
        if level == "Advanced": return 0.8
        return 0.5

    def calculate_next_difficulty(self, performance: Dict) -> float:
        """
        Calculates next difficulty score based on:
        - is_correct (bool)
        - duration (seconds)
        - violations (int)
        """
        is_correct = performance.get('is_correct', False)
        duration = performance.get('duration', 60)
        violations = performance.get('violations', 0)
        
        # Base adjustment
        adjustment = 0.1 if is_correct else -0.15
        
        # Speed bonus/penalty (Expected time 300s for a coding task)
        # Faster completion increases difficulty more aggressively
        if is_correct:
            speed_factor = max(0.05, (300 - duration) / 300 * 0.1)
            adjustment += speed_factor
            
        # Violation penalty
        if violations > 0:
            adjustment -= (violations * 0.05)
            
        self.difficulty_score = max(0.1, min(1.0, self.difficulty_score + adjustment))
        return self.difficulty_score

    def get_current_level(self) -> str:
        if self.difficulty_score < 0.4: return "Beginner"
        if self.difficulty_score < 0.7: return "Intermediate"
        return "Advanced"

    def get_prompt_instructions(self) -> str:
        level = self.get_current_level()
        return f"""
        TECHNICAL CHALLENGE MODE:
        - Candidate Level: {level} (Performance Score: {self.difficulty_score:.2f})
        - Department: {self.department}
        
        STRICT GUIDELINES:
        1. Generate a coding challenge appropriate for a {level} level in {self.department}.
        2. If {level} is Beginner: Focus on basic syntax, control flow, and simple string/array manipulations.
        3. If {level} is Intermediate: Focus on standard Data Structures (Trees, Graphs, HashMaps) and Algorithms (Sorting, Searching, Recursion).
        4. If {level} is Advanced: Focus on Optimization (Time/Space complexity), System Design edge cases, and complex algorithmic patterns (DP, Backtracking).
        5. Provide a clear problem statement and a hidden 'correctSolution' variable for internal evaluation.
        """

    def record_attempt(self, question: str, code: str, performance: Dict):
        self.history.append({
            "question": question,
            "code": code,
            "performance": performance,
            "difficulty_at_time": self.difficulty_score
        })
