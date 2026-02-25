import librosa
import numpy as np
import io
import soundfile as sf

def analyze_audio_prosody(audio_path: str):
    """
    Analyzes audio file for prosody features: Pitch variation, Volume, Pace.
    """
    try:
        y, sr = librosa.load(audio_path, sr=None)
        
        # 1. Volume (RMS Energy)
        rms = librosa.feature.rms(y=y)[0]
        avg_volume = np.mean(rms)
        is_quiet = avg_volume < 0.02
        
        # 2. Pitch (F0)
        # Extract Pitch
        f0, voiced_flag, voiced_probs = librosa.pyin(y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))
        f0 = f0[~np.isnan(f0)] # Remove NaNs
        
        pitch_variance = 0
        tone = "Neutral"
        
        if len(f0) > 0:
            pitch_std = np.std(f0)
            pitch_variance = pitch_std
            
            if pitch_std < 20: 
                tone = "Monotone"
            elif pitch_std > 50:
                tone = "Expressive"
            else:
                tone = "Normal"
        
        # 3. Pace / Pauses
        # Detect silence
        non_silent_intervals = librosa.effects.split(y, top_db=20)
        pause_duration = (len(y) - sum(len(y[start:end]) for start, end in non_silent_intervals)) / sr
        
        speech_duration = len(y) / sr
        pause_ratio = pause_duration / (speech_duration + 1e-6)
        
        pace = "Normal"
        if pause_ratio > 0.4:
            pace = "Hesitant"
        elif pause_ratio < 0.1:
            pace = "Fast"

        return {
            "volume_level": float(avg_volume),
            "is_quiet": bool(is_quiet),
            "pitch_variance": float(pitch_variance),
            "tone": tone,
            "pause_ratio": float(pause_ratio),
            "pace": pace
        }

    except Exception as e:
        print(f"Error in audio analysis: {e}")
        return {
            "error": str(e),
            "tone": "Unknown",
            "pace": "Unknown"
        }
