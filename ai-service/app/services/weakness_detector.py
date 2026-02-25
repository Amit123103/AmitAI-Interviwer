"""
Weakness Detection Service - Pattern Analysis Across Interview

Analyzes conversation history to detect knowledge gaps and avoidance patterns.
"""

import json
from typing import Dict, List, Optional

class WeaknessDetector:
    """
    Detects patterns of weakness or avoidance across the interview.
    """
    
    # Common technical topics to track
    TECHNICAL_TOPICS = [
        "scalability", "concurrency", "security", "testing",
        "performance", "database", "architecture", "deployment",
        "error handling", "caching", "async", "distributed systems"
    ]
    
    def __init__(self, model_name: str):
        self.model_name = model_name
    
    def analyze_conversation_patterns(self, conversation_history: List[Dict]) -> Dict:
        """
        Analyzes the entire conversation to detect patterns.
        
        Args:
            conversation_history: List of {"question": str, "answer": str, "score": int}
            
        Returns:
            Dict with detected weaknesses and avoidance patterns
        """
        if len(conversation_history) < 3:
            return {"status": "insufficient_data"}
        
        # Analyze scores by topic
        topic_scores = {}
        topic_mentions = {}
        avoided_topics = []
        
        for turn in conversation_history:
            question = turn.get('question', '').lower()
            answer = turn.get('answer', '').lower()
            score = turn.get('score', 5)
            
            # Check which topics were mentioned
            for topic in self.TECHNICAL_TOPICS:
                if topic in question or topic in answer:
                    if topic not in topic_scores:
                        topic_scores[topic] = []
                        topic_mentions[topic] = 0
                    topic_scores[topic].append(score)
                    topic_mentions[topic] += 1
        
        # Detect weaknesses (topics with low average scores)
        weaknesses = []
        for topic, scores in topic_scores.items():
            avg_score = sum(scores) / len(scores)
            if avg_score < 6 and len(scores) >= 2:
                weaknesses.append({
                    "topic": topic,
                    "avg_score": round(avg_score, 1),
                    "mentions": len(scores)
                })
        
        # Detect avoidance (topics mentioned in questions but not in answers)
        for turn in conversation_history:
            question = turn.get('question', '').lower()
            answer = turn.get('answer', '').lower()
            
            for topic in self.TECHNICAL_TOPICS:
                if topic in question and topic not in answer:
                    if topic not in avoided_topics:
                        avoided_topics.append(topic)
        
        # Detect vague answer patterns
        vague_count = sum(1 for turn in conversation_history if turn.get('score', 10) <= 4)
        vague_percentage = (vague_count / len(conversation_history)) * 100
        
        return {
            "status": "analyzed",
            "weaknesses": sorted(weaknesses, key=lambda x: x['avg_score']),
            "avoided_topics": avoided_topics[:3],  # Top 3
            "vague_answer_rate": round(vague_percentage, 1),
            "total_turns": len(conversation_history)
        }
    
    def generate_targeted_question(self, weakness_analysis: Dict, profile: dict) -> Optional[str]:
        """
        [DEPRECATED] Strategic question generation is now handled by the Unified Turn Brain in main.py.
        """
        return None
    
    def should_target_weakness(self, current_step: int, total_steps: int, weakness_analysis: Dict) -> bool:
        """
        Determines if we should ask a weakness-targeting question.
        
        Args:
            current_step: Current interview step
            total_steps: Total interview steps
            weakness_analysis: Detected weaknesses
            
        Returns:
            True if we should target a weakness now
        """
        # Only target weaknesses in the middle/late stages
        if current_step < 3:
            return False
        
        # Don't do it too frequently (every 3-4 questions)
        if current_step % 3 != 0:
            return False
        
        # Must have detected weaknesses
        if weakness_analysis.get('status') != 'analyzed':
            return False
        
        weaknesses = weakness_analysis.get('weaknesses', [])
        avoided = weakness_analysis.get('avoided_topics', [])
        
        return len(weaknesses) > 0 or len(avoided) > 0
