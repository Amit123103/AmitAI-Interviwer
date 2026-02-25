from typing import List, Optional
import random

class InterviewManager:
    def __init__(self, profile_data: dict, level: str = "intermediate"):
        self.profile = profile_data
        self.level = level
        self.questions_asked = 0
        self.career_focus = profile_data.get("dreamCompany", "Tech Industry")
        
    def generate_warmup_question(self) -> str:
        questions = [
            f"Welcome, {self.profile.get('fullName')}! To start off, could you tell me a bit about yourself and your background in {self.profile.get('course')}?",
            "It's great to meet you. Let's begin with a quick introduction. What motivated you to pursue a career in this field?",
            "Let's start simple. How would you describe your communication style to a new team?"
        ]
        return random.choice(questions)

    def generate_technical_question(self, resume_data: dict) -> str:
        # In a real app, this would call OpenAI with the resume context
        skills = resume_data.get("skills", ["General Software Engineering"])
        skill = random.choice(skills)
        return f"Based on your resume, you have experience with {skill}. Can you describe a challenging project where you utilized this skill?"

    def generate_behavioral_question(self) -> str:
        target = self.profile.get("dreamCompany", "your dream company")
        questions = [
            f"Since you're aiming for {target}, how do you handle high-pressure environments and tight deadlines?",
            f"At {target}, teamwork is essential. Tell me about a time you had a conflict with a peer and how you resolved it.",
            "Where do you see yourself in 5 years, and how does this role fit into that vision?"
        ]
        return random.choice(questions)
