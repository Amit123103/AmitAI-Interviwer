"""
Conversational Enhancement Service - Hyper-Realism V2

Makes AI questions sound indistinguishable from humans by simulating 
dysfluency (um/uh), speech repairs, and advanced prosody curves.
"""

import random
import re
from typing import Dict, List, Optional

class ConversationalEnhancer:
    """
    Enhances questions with hyper-realistic professional speaking patterns.
    """
    
    # Natural transitions based on context
    TRANSITIONS = {
        "good_answer": [
            "That's a solid answer. ",
            "Great, I like that approach. ",
            "Interesting perspective. ",
            "Good thinking. ",
            "I appreciate the detail there. "
        ],
        "vague_answer": [
            "I see. Let me dig a bit deeper on that. ",
            "Okay, I'd like to understand more about that. ",
            "Hmm, let's explore that further. ",
            "Alright, can we dive into that a bit more? "
        ],
        "topic_change": [
            "Now, shifting gears a bit, ",
            "Let's move on to something different. ",
            "I'd like to switch topics for a moment. ",
            "Changing direction here, ",
            "Let me ask you about something else. "
        ],
        "follow_up": [
            "Building on that, ",
            "Following up on what you just said, ",
            "That brings up another question - ",
            "Related to that, ",
            "On that same topic, "
        ],
        "system_design": [
            "Looking at your architecture, ",
            "From a scalability perspective, ",
            "Thinking about the bottlenecks here, ",
            "Considering the data flow on your board, "
        ]
    }
    
    # Advanced Thinking Markers & Speech Repairs (V2)
    THINKING_MARKERS = [
        "Wait, let me step back for a second.",
        "Actually, that's an interesting point.",
        "Hmm, thinking about how that scales...",
        "Let me rephrase that slightly.",
        "Right, okay, let's look at this differently."
    ]
    
    REPAIR_MARKERS = [
        "Actually, better yet,",
        "Wait, let me re-phrase that—",
        "Or rather,",
        "Actually, I'm more interested in—"
    ]
    
    # Dysfluencies (Selective injection)
    DYSFLUENCIES = ["um", "uh", "hmm"]
    
    # Technical Keyword List (for emphasis)
    TECH_KEYWORDS = [
        "latency", "scalability", "throughput", "consistency", "availability", 
        "microservices", "database", "cache", "redis", "kafka", "docker", 
        "kubernetes", "react", "hooks", "concurrency", "bottleneck", "load balancer",
        "sharding", "replication", "event-driven", "idempotency"
    ]
    
    SOFTENERS = ["I'm curious about ", "I'd love to hear your thoughts on ", "Walk me through ", "Help me understand ", "Tell me about "]
    ACKNOWLEDGMENTS = ["Got it. ", "I understand. ", "Makes sense. ", "Fair enough. ", "Okay. "]
    
    def __init__(self):
        pass
    
    def enhance_question(self, raw_question: str, context: Dict) -> str:
        """
        Enhances a raw question to sound hyper-realistic.
        """
        if context.get('is_first_question'):
            return self._enhance_opening(raw_question)
        
        # 1. Start with Contextual Acknowledgment
        prefix = ""
        keyword = context.get('keyword')
        if keyword and random.random() > 0.3:
            prefix = f"Right, the {keyword} aspect makes total sense. "
            
        # 2. Add natural transitions
        prefix += self._get_transition(context)
        
        # 3. Random thinking marker or Speech Repair (V2)
        r = random.random()
        if r > 0.85:
            prefix = random.choice(self.THINKING_MARKERS) + " " + prefix
        elif r < 0.1:
            prefix = random.choice(self.REPAIR_MARKERS) + " " + prefix
        
        # 4. Soften if it's a challenging question
        if context.get('move') in ['DEEP_DIVE', 'PROBE']:
            raw_question = self._soften_question(raw_question)
        
        # 5. Inject Dysfluency (V2)
        if random.random() > 0.8:
            raw_question = self._inject_dysfluency(raw_question)
        
        # 6. Add acknowledgment if previous answer was good
        if context.get('previous_score', 5) >= 7 and random.random() > 0.5:
            if not prefix.startswith("Right"):
                prefix = random.choice(self.ACKNOWLEDGMENTS) + prefix
        
        # Combine
        enhanced = prefix + raw_question
        
        if not enhanced.strip().endswith('?'):
            enhanced = enhanced.strip() + '?'
        
        return enhanced
    
    def _inject_dysfluency(self, text: str) -> str:
        """Injects selective um/uh at natural pause points."""
        words = text.split()
        if len(words) < 5: return text
        
        # Choose a random split point after the first few words
        split_idx = random.randint(2, min(5, len(words)-1))
        filler = random.choice(self.DYSFLUENCIES)
        
        # Transform: "Tell me about React" -> "Tell me, uh, about React"
        return " ".join(words[:split_idx]) + f", {filler}, " + " ".join(words[split_idx:])

    def _get_transition(self, context: Dict) -> str:
        previous_score = context.get('previous_score', 5)
        move = context.get('move', 'MOVE_ON')
        topic_changed = context.get('topic_changed', False)
        sector = context.get('sector', 'General')
        
        if sector == "System Design" and random.random() > 0.5:
            return random.choice(self.TRANSITIONS['system_design'])
            
        if topic_changed:
            return random.choice(self.TRANSITIONS['topic_change'])
        elif move == 'PROBE' or previous_score < 5:
            return random.choice(self.TRANSITIONS['vague_answer'])
        elif move == 'DEEP_DIVE':
            return random.choice(self.TRANSITIONS['follow_up'])
        elif previous_score >= 8:
            return random.choice(self.TRANSITIONS['good_answer'])
        else:
            return ""
    
    def _soften_question(self, question: str) -> str:
        question_words = ['what', 'how', 'why', 'when', 'where', 'can you', 'could you']
        question_lower = question.lower().strip()
        for word in question_words:
            if question_lower.startswith(word):
                softener = random.choice(self.SOFTENERS)
                rest = question[len(word):].strip()
                if rest and rest[0].isupper():
                    rest = rest[0].lower() + rest[1:]
                return f"{softener}{rest}"
        return question

    def _enhance_opening(self, question: str) -> str:
        greetings = ["Thanks for joining me today. Let's get started. ", "Great to have you here. ", "Alright, let's dive in. ", "Thanks for taking the time. "]
        return random.choice(greetings) + question
    
    def _apply_emphasis(self, text: str) -> str:
        for kw in self.TECH_KEYWORDS:
            pattern = re.compile(rf'\b({kw})\b', re.IGNORECASE)
            text = pattern.sub(r'<emphasis level="moderate">\1</emphasis>', text)
        return text

    def wrap_ssml(self, text: str, persona: str = "Friendly Mentor", emotion: str = "Neutral") -> str:
        """
        Wraps text in cleaned SSML with natural neural prosody.
        """
        # 1. Apply Technical Emphasis (Subtle)
        text = self._apply_emphasis(text)
        
        # 2. Cleanup whitespace and potentially broken tags
        text = text.replace('\n', ' ').strip()
        
        # 3. Define adaptive prosody (Neural voices handle punctuation well naturally)
        rate = "+0%"
        pitch = "+0%"
        
        # Switch to more natural, premium-sounding Neural voices
        voice_name = "en-US-AvaNeural" if persona == "Friendly Mentor" else "en-US-AndrewNeural"
        
        # Styles for Ava/Andrew (Professional and Friendly)
        style = "cheerful" if persona == "Friendly Mentor" else "serious"
        
        if emotion == "Nervous":
            rate = "-5%" # Minimal change to keep it natural
        elif persona == "Principal Architect" or persona == "Strict Lead":
            style = "friendly" # Andrew sounds better in friendly/neutral
            rate = "+0%"
            
        ssml = f"""<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
            <voice name="{voice_name}">
                <mstts:express-as style="{style}" styledegree="1.0">
                    <prosody rate="{rate}" pitch="{pitch}">
                        {text}
                    </prosody>
                </mstts:express-as>
            </voice>
        </speak>"""
        return ssml.strip()

    def add_natural_pauses(self, question: str) -> str:
        transitions = ["Now", "So", "Alright", "Okay", "Well", "Let me", "I'd like", "I want to", "Tell me"]
        for trans in transitions:
            if question.startswith(trans + " "):
                question = question.replace(trans + " ", trans + ", ", 1)
        if " and " in question and len(question) > 60:
            question = question.replace(" and ", ", and ", 1)
        return question

    def detect_topic_change(self, previous_question: str, current_question: str) -> bool:
        prev_keywords = set(previous_question.lower().split())
        curr_keywords = set(current_question.lower().split())
        common_words = {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'you', 'your', 'how', 'what', 'why', 'tell', 'me', 'about', 'can', 'could', 'would', 'did'}
        prev_keywords -= common_words
        curr_keywords -= common_words
        if not prev_keywords or not curr_keywords:
            return False
        overlap = len(prev_keywords & curr_keywords) / max(len(prev_keywords | curr_keywords), 1)
        return overlap < 0.2
