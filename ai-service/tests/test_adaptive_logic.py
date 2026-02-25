
import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_generate_question():
    print("Testing /generate-question endpoint with Adaptive Logic...")
    
    profile = {
        "fullName": "Test Candidate",
        "totalQuestions": 5,
        "skills": ["Python", "React", "AWS"],
        "projects": ["E-commerce App"],
        "dreamCompany": "Tech Corp"
    }
    
    # 1. Test Vague Answer -> Should trigger PROBE
    print("\n[TEST 1] Sending VAGUE answer...")
    payload_vague = {
        "user_id": "test_user",
        "context": "I built a website.",
        "student_profile": profile,
        "current_step": 2, # Project Deep Dive
        "difficulty": "Intermediate"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/generate-question", json=payload_vague)
        if response.status_code == 200:
            data = response.json()
            thought = data.get("thought_process", {})
            question = data.get("question", "")
            
            print(f"Thought Move: {thought.get('move')}")
            print(f"Suggestion: {thought.get('suggestion')}")
            print(f"AI Question: {question}")
            
            if thought.get("move") in ["PROBE", "CLARIFY"]:
                print("✅ PASS: System correctly identified vague answer.")
            else:
                print(f"⚠️ WARN: Expected PROBE, got {thought.get('move')}")
        else:
            print(f"❌ ERROR: Request failed with {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ EXCEPTION: {e}")

    # 2. Test Good Answer -> Should trigger DEEP_DIVE or MOVE_ON
    print("\n[TEST 2] Sending DETAILED answer...")
    payload_detailed = {
        "user_id": "test_user",
        "context": "I built a scalable e-commerce app using React for the frontend and Python FastAPI for the backend. I deployed it on AWS Lambda using serverless architecture to handle high traffic spikes efficiently.",
        "student_profile": profile,
        "current_step": 2,
        "difficulty": "Intermediate"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/generate-question", json=payload_detailed)
        if response.status_code == 200:
            data = response.json()
            thought = data.get("thought_process", {})
            question = data.get("question", "")
            
            print(f"Thought Move: {thought.get('move')}")
            print(f"Suggestion: {thought.get('suggestion')}")
            print(f"AI Question: {question}")
            
            if thought.get("move") in ["DEEP_DIVE", "MOVE_ON"]:
                print("✅ PASS: System correctly identified detailed answer.")
            else:
                print(f"⚠️ WARN: Expected DEEP_DIVE/MOVE_ON, got {thought.get('move')}")
        else:
            print(f"❌ ERROR: Request failed with {response.status_code}")
    except Exception as e:
        print(f"❌ EXCEPTION: {e}")

    # 3. Test Technical Answer -> Should trigger CODING_TASK
    print("\n[TEST 3] Sending TECHNICAL answer (Trigger Coding Task)...")
    payload_tech = {
        "user_id": "test_user",
        "context": "I have extensive experience with Python's multiprocessing and threading modules. For instance, I recently optimized a data processing pipeline using a ProcessPoolExecutor to handle CPU-bound tasks in parallel, while using asyncio for I/O-bound network requests.",
        "student_profile": profile,
        "current_step": 3, # Technical stage
        "difficulty": "Advanced"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/generate-question", json=payload_tech)
        if response.status_code == 200:
            data = response.json()
            thought = data.get("thought_process", {})
            question = data.get("question", "")
            
            print(f"Thought Move: {thought.get('move')}")
            print(f"Suggestion: {thought.get('suggestion')}")
            # Check if there is a code block in the question
            has_code = "```" in question
            print(f"Question has code block: {has_code}")
            
            if thought.get("move") == "CODING_TASK" or has_code:
                print("✅ PASS: System triggered a technical coding challenge.")
            else:
                print(f"⚠️ WARN: Expected CODING_TASK, got {thought.get('move')}")
        else:
            print(f"❌ ERROR: Request failed with {response.status_code}")
    except Exception as e:
        print(f"❌ EXCEPTION: {e}")

if __name__ == "__main__":
    test_generate_question()
