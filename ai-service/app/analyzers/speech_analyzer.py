"""
Speech Analyzer
Real-time speech analysis for filler words, pace, and clarity
"""

from typing import Dict, List, Tuple
import re
from collections import Counter


class SpeechAnalyzer:
    """
    Analyzes speech patterns for real-time feedback
    """
    
    # Common filler words and phrases
    FILLER_WORDS = {
        'um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally',
        'sort of', 'kind of', 'i mean', 'you see', 'right', 'okay', 'so',
        'well', 'just', 'really', 'very', 'quite', 'perhaps', 'maybe'
    }
    
    # Optimal speaking metrics
    OPTIMAL_WPM = 150  # Words per minute
    OPTIMAL_WPM_RANGE = (130, 170)
    
    def __init__(self):
        self.analysis_history = []
    
    def detect_filler_words(self, transcript: str) -> Dict:
        """
        Detect and count filler words in transcript
        
        Args:
            transcript: Speech transcript
            
        Returns:
            Dictionary with filler word analysis
        """
        transcript_lower = transcript.lower()
        words = transcript_lower.split()
        total_words = len(words)
        
        if total_words == 0:
            return {
                'total_fillers': 0,
                'filler_rate': 0,
                'filler_words': {},
                'severity': 'none'
            }
        
        # Count individual filler words
        filler_counts = {}
        total_fillers = 0
        
        for filler in self.FILLER_WORDS:
            if ' ' in filler:  # Multi-word fillers
                count = transcript_lower.count(filler)
            else:  # Single word fillers
                count = words.count(filler)
            
            if count > 0:
                filler_counts[filler] = count
                total_fillers += count
        
        # Calculate filler rate (fillers per 100 words)
        filler_rate = (total_fillers / total_words) * 100
        
        # Determine severity
        if filler_rate < 2:
            severity = 'excellent'
        elif filler_rate < 5:
            severity = 'good'
        elif filler_rate < 10:
            severity = 'moderate'
        else:
            severity = 'high'
        
        return {
            'total_fillers': total_fillers,
            'filler_rate': filler_rate,
            'filler_words': filler_counts,
            'severity': severity,
            'total_words': total_words,
            'most_common': max(filler_counts.items(), key=lambda x: x[1]) if filler_counts else None
        }
    
    def calculate_speaking_pace(
        self, 
        transcript: str, 
        duration_seconds: float
    ) -> Dict:
        """
        Calculate speaking pace (words per minute)
        
        Args:
            transcript: Speech transcript
            duration_seconds: Duration of speech in seconds
            
        Returns:
            Pace analysis dictionary
        """
        if duration_seconds <= 0:
            return {
                'wpm': 0,
                'status': 'unknown',
                'feedback': 'Unable to calculate pace'
            }
        
        words = transcript.split()
        word_count = len(words)
        
        # Calculate WPM
        wpm = (word_count / duration_seconds) * 60
        
        # Determine status
        if wpm < self.OPTIMAL_WPM_RANGE[0]:
            status = 'too_slow'
            feedback = f"Speaking pace is slow ({wpm:.0f} WPM). Try to speak a bit faster."
        elif wpm > self.OPTIMAL_WPM_RANGE[1]:
            status = 'too_fast'
            feedback = f"Speaking pace is fast ({wpm:.0f} WPM). Slow down for better clarity."
        else:
            status = 'optimal'
            feedback = f"Speaking pace is good ({wpm:.0f} WPM)."
        
        return {
            'wpm': wpm,
            'status': status,
            'feedback': feedback,
            'word_count': word_count,
            'duration': duration_seconds,
            'optimal_range': self.OPTIMAL_WPM_RANGE
        }
    
    def analyze_confidence(self, audio_features: Dict, transcript: str) -> Dict:
        """
        Analyze confidence from audio and text features
        
        Args:
            audio_features: Audio analysis data
            transcript: Speech transcript
            
        Returns:
            Confidence analysis
        """
        confidence_indicators = {
            'volume_consistency': 0,
            'pace_stability': 0,
            'minimal_fillers': 0,
            'assertive_language': 0
        }
        
        # 1. Volume consistency (from audio features)
        volume_std = audio_features.get('volume_std', 0.2)
        if volume_std < 0.15:
            confidence_indicators['volume_consistency'] = 100
        else:
            confidence_indicators['volume_consistency'] = max(0, 100 - (volume_std * 200))
        
        # 2. Pace stability
        pace_std = audio_features.get('pace_std', 20)
        if pace_std < 15:
            confidence_indicators['pace_stability'] = 100
        else:
            confidence_indicators['pace_stability'] = max(0, 100 - pace_std)
        
        # 3. Minimal fillers
        filler_analysis = self.detect_filler_words(transcript)
        if filler_analysis['severity'] == 'excellent':
            confidence_indicators['minimal_fillers'] = 100
        elif filler_analysis['severity'] == 'good':
            confidence_indicators['minimal_fillers'] = 75
        elif filler_analysis['severity'] == 'moderate':
            confidence_indicators['minimal_fillers'] = 50
        else:
            confidence_indicators['minimal_fillers'] = 25
        
        # 4. Assertive language (presence of definitive statements)
        assertive_words = ['definitely', 'certainly', 'clearly', 'obviously', 'will', 'must', 'should']
        tentative_words = ['maybe', 'perhaps', 'might', 'possibly', 'probably', 'i think', 'i guess']
        
        transcript_lower = transcript.lower()
        assertive_count = sum(1 for word in assertive_words if word in transcript_lower)
        tentative_count = sum(1 for word in tentative_words if word in transcript_lower)
        
        if assertive_count > tentative_count:
            confidence_indicators['assertive_language'] = 100
        elif assertive_count == tentative_count:
            confidence_indicators['assertive_language'] = 60
        else:
            confidence_indicators['assertive_language'] = 30
        
        # Calculate overall confidence score
        overall_confidence = sum(confidence_indicators.values()) / len(confidence_indicators)
        
        # Determine confidence level
        if overall_confidence >= 80:
            level = 'high'
        elif overall_confidence >= 60:
            level = 'moderate'
        else:
            level = 'low'
        
        return {
            'confidence_score': overall_confidence / 100,
            'confidence_level': level,
            'indicators': confidence_indicators,
            'feedback': self._generate_confidence_feedback(confidence_indicators)
        }
    
    def _generate_confidence_feedback(self, indicators: Dict) -> List[str]:
        """Generate confidence improvement feedback"""
        feedback = []
        
        if indicators['volume_consistency'] < 60:
            feedback.append("Maintain consistent volume throughout your response.")
        
        if indicators['pace_stability'] < 60:
            feedback.append("Try to maintain a steady speaking pace.")
        
        if indicators['minimal_fillers'] < 60:
            feedback.append("Reduce filler words like 'um', 'uh', and 'like'.")
        
        if indicators['assertive_language'] < 60:
            feedback.append("Use more definitive language to sound confident.")
        
        return feedback
    
    def measure_clarity(self, transcript: str, audio_features: Dict) -> Dict:
        """
        Measure speech clarity
        
        Args:
            transcript: Speech transcript
            audio_features: Audio analysis data
            
        Returns:
            Clarity metrics
        """
        clarity_score = 100
        issues = []
        
        # 1. Check for run-on sentences (very long sentences)
        sentences = re.split(r'[.!?]+', transcript)
        avg_sentence_length = sum(len(s.split()) for s in sentences if s.strip()) / max(len(sentences), 1)
        
        if avg_sentence_length > 30:
            clarity_score -= 20
            issues.append("Sentences are too long. Break them into shorter statements.")
        
        # 2. Check for repetition
        words = transcript.lower().split()
        word_freq = Counter(words)
        repeated_words = [word for word, count in word_freq.items() if count > 3 and len(word) > 4]
        
        if len(repeated_words) > 3:
            clarity_score -= 15
            issues.append(f"Avoid repeating words: {', '.join(repeated_words[:3])}")
        
        # 3. Audio clarity (from features)
        audio_clarity = audio_features.get('clarity_score', 0.8) * 100
        clarity_score = (clarity_score + audio_clarity) / 2
        
        # Determine clarity level
        if clarity_score >= 80:
            level = 'excellent'
        elif clarity_score >= 65:
            level = 'good'
        elif clarity_score >= 50:
            level = 'fair'
        else:
            level = 'poor'
        
        return {
            'clarity_score': clarity_score / 100,
            'clarity_level': level,
            'issues': issues,
            'avg_sentence_length': avg_sentence_length
        }
    
    def generate_real_time_feedback(
        self,
        transcript: str,
        duration: float,
        audio_features: Dict
    ) -> Dict:
        """
        Generate comprehensive real-time feedback
        
        Args:
            transcript: Current transcript
            duration: Duration in seconds
            audio_features: Audio analysis data
            
        Returns:
            Real-time feedback dictionary
        """
        # Analyze all aspects
        filler_analysis = self.detect_filler_words(transcript)
        pace_analysis = self.calculate_speaking_pace(transcript, duration)
        confidence_analysis = self.analyze_confidence(audio_features, transcript)
        clarity_analysis = self.measure_clarity(transcript, audio_features)
        
        # Determine priority feedback (most important issue)
        priority_feedback = []
        
        if filler_analysis['severity'] in ['high', 'moderate']:
            priority_feedback.append({
                'type': 'filler_words',
                'severity': 'warning',
                'message': f"Reduce filler words ({filler_analysis['total_fillers']} detected)"
            })
        
        if pace_analysis['status'] != 'optimal':
            priority_feedback.append({
                'type': 'speaking_pace',
                'severity': 'info',
                'message': pace_analysis['feedback']
            })
        
        if confidence_analysis['confidence_level'] == 'low':
            priority_feedback.append({
                'type': 'confidence',
                'severity': 'warning',
                'message': "Speak with more confidence and clarity"
            })
        
        return {
            'filler_words': filler_analysis,
            'speaking_pace': pace_analysis,
            'confidence': confidence_analysis,
            'clarity': clarity_analysis,
            'priority_feedback': priority_feedback[:2],  # Top 2 issues
            'timestamp': duration
        }
