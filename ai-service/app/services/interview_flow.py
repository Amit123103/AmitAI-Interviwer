
from typing import List, Dict, Optional
import json

class InterviewFlowManager:
    """
    Manages the state and flow of the interview.
    Transitions from linear steps to a dynamic state machine.
    """
    
    STAGES = [
        "INTRODUCTION",
        "EXPERIENCE_DEEP_DIVE", 
        "TECHNICAL_CONCEPTS",
        "BEHAVIORAL_SITUATIONAL",
        "PROBLEM_SOLVING_CHALLENGE",
        "CLOSING"
    ]

    def __init__(self, profile_data: dict, total_questions: int = 7):
        self.profile = profile_data
        self.total_questions = total_questions
        self.history: List[Dict] = []
        self.current_question_index = 0
        self.current_stage = "INTRODUCTION"
        self.covered_topics = set()
        
    def update_stage(self, current_step: int):
        """
        Determines the current stage based on step count.
        """
        self.current_question_index = current_step
        
        if current_step == 1:
            self.current_stage = "INTRODUCTION"
        elif current_step == self.total_questions:
            self.current_stage = "CLOSING"
        elif current_step == 2:
            self.current_stage = "EXPERIENCE_DEEP_DIVE"
        elif current_step == self.total_questions - 1:
             self.current_stage = "PROBLEM_SOLVING_CHALLENGE"
        else:
            # Alternate for middle steps
            if current_step % 2 != 0:
                self.current_stage = "BEHAVIORAL_SITUATIONAL"
            else:
                self.current_stage = "TECHNICAL_CONCEPTS"

    def get_stage_instructions(self) -> str:
        """
        Returns specific prompt instructions for the current stage.
        """
        projects = self.profile.get('projects', [])
        skills = self.profile.get('skills', [])
        
        # Select a topic dynamically that hasn't been covered
        target_project = next((p for p in projects if p not in self.covered_topics), projects[0] if projects else "your recent project")
        target_skill = next((s for s in skills if s not in self.covered_topics), skills[0] if skills else "your professional skills")
        
        # Mark as covered (optimistic)
        if self.current_stage == "EXPERIENCE_DEEP_DIVE": self.covered_topics.add(target_project)
        if self.current_stage == "TECHNICAL_CONCEPTS": self.covered_topics.add(target_skill)
        
        instructions = {
            "INTRODUCTION": "Start with a warm, professional greeting. Mention you've reviewed their profile. Ask them to introduce themselves, focusing on their most recent experience.",
            
            "EXPERIENCE_DEEP_DIVE": f"Focus on this specific project: '{target_project}'. Ask a technical question about the architecture, a difficult bug they solved, or why they chose a specific technology stack for it. Do not ask for a general summary.",
            
            "TECHNICAL_CONCEPTS": f"Ask a conceptual question related to '{target_skill}'. For example, if it's React, ask about Virtual DOM or Hooks. If Python, ask about GIL or Decorators. Test their depth of knowledge.",
            
            "BEHAVIORAL_SITUATIONAL": "Ask a STAR method question. Example: 'Tell me about a time you disagreed with a team member' or 'Tell me about a time you missed a deadline'. Focus on soft skills.",
            
            "PROBLEM_SOLVING_CHALLENGE": "Present a short, relevant scenario. E.g., 'If our API latency spiked to 5 seconds, how would you debug it?' or 'How would you design a URL shortener database schema?'. Keep it discussion-based.",
            
            "CLOSING": "Wrap up the interview. Ask if they have any questions for you (the AI). Respond briefly to their question if they ask one, then wish them luck."
        }
        return instructions.get(self.current_stage, "Continue the interview professionally.")

    def get_system_context(self, sector="General", persona="Friendly Mentor") -> str:
        """
        Generates the dynamic system context for the LLM.
        """
        self.update_stage(self.current_question_index)
        
        projects = ", ".join(self.profile.get('projects', [])) or "None listed"
        skills = ", ".join(self.profile.get('skills', [])) or "None listed"
        resume_text = self.profile.get('resumeText', '')
        
        # Use full resume text if available, otherwise fallback to structured data
        profile_context = f"""
        RESUME SUMMARY (Extracted):
        - Projects: {projects}
        - Skills: {skills}
        """
        
        if resume_text and len(resume_text) > 50:
            profile_context += f"\n\nFULL RESUME TEXT:\n{resume_text[:3000]}..." # Truncate to avoid context overflow
        else:
            profile_context += "\n(No full resume text available, rely on extracted summary)"

        senior_guidelines = ""
        experience_level = self.profile.get('experienceLevel', 'Entry')
        if "Senior" in experience_level or "Lead" in experience_level or "Staff" in experience_level:
            senior_guidelines = """
            SENIOR/STAFF INTERVIEW MODE:
            - **Challenge Assumptions**: If they choose a tech stack, ask "Why not X instead?".
            - **Focus on Trade-offs**: Ask about Consistency vs Availability, Latency vs Throughput.
            - **Scale**: Ask "How does this break at 10M users?".
            - **Failure Modes**: Ask "What happens if the cache fails?".
            - Do not accept "It just works" answers.
            """

        return f"""
        You are an Expert AI Interviewer named '{persona}'.
        You are conducting a {sector} interview.
        
        CANDIDATE PROFILE:
        {profile_context}
        
        Current Education: {self.profile.get('course', 'N/A')}
        Experience Level: {experience_level}
        
        CURRENT STAGE: {self.current_stage} (Question {self.current_question_index} of {self.total_questions})
        
        YOUR GOAL: {self.get_stage_instructions()}
        
        {senior_guidelines}
        
        INTERVIEW GUIDELINES:
        1. **USE THE RESUME**: Ask about specific details found in the resume text (e.g., "I see you used Redux in your e-commerce project...").
        2. BE SPECIFIC: Do not ask generic questions.
        3. SHORT & CONVERSATIONAL: Max 2-3 sentences.
        4. FOLLOW UP: Dig deeper into their previous answer.
        5. TONE: {persona}.
        """

