import requests
import json
import os

URL = "http://localhost:8000/interview-turn"
AUDIO_FILE = "temp_default.webm"

# Create a dummy audio file if it doesn't await exist
# Simple dummy webm header or just random bytes might fail if ffmpeg/whisper checks header
# let's try to copy an existing one if possible, or use a minimal valid webm
if not os.path.exists(AUDIO_FILE):
    with open(AUDIO_FILE, "wb") as f:
        f.write(b"\x1a\x45\xdf\xa3") # Minimal EBML header start

metadata = {
    "user_id": "test_user",
    "student_profile": {"name": "Test User", "skills": ["Python", "React"]},
    "difficulty": "Intermediate",
    "sector": "General",
    "persona": "Friendly Mentor",
    "current_step": 1,
    "total_steps": 5,
    "previous_question": "Tell me about yourself.",
    "target_company": "Google",
    "job_description": "Software Engineer"
}

files = {
    'file': ('audio.webm', open(AUDIO_FILE, 'rb'), 'audio/webm')
}

data = {
    'metadata': json.dumps(metadata)
}

print(f"Sending request to {URL}...")
try:
    response = requests.post(URL, files=files, data=data)
    print("Status Code:", response.status_code)
    
    with open("last_response.json", "w") as f:
        try:
            json.dump(response.json(), f, indent=2)
            print("Response saved to last_response.json")
        except:
            f.write(response.text)
            print("Raw text response saved to last_response.json")
            
except Exception as e:
    print(f"Request failed: {e}")
