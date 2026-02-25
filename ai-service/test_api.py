import requests
import time
import subprocess
import signal
import os
import sys

# Start the service
print("Starting AI Service...")
process = subprocess.Popen(["python", "-m", "app.main"], 
                           stdout=subprocess.PIPE, 
                           stderr=subprocess.PIPE,
                           cwd=os.getcwd(),
                           env={**os.environ, "PYTHONPATH": os.getcwd()})

# Wait for service to start
print("Waiting for service to start...")
time.sleep(10)

try:
    # Test Root Endpoint
    print("\nTesting GET / ...")
    try:
        response = requests.get("http://127.0.0.1:8000/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except requests.exceptions.ConnectionError:
        print("Failed to connect to service.")
        stdout, stderr = process.communicate(timeout=5)
        print("STDOUT:", stdout.decode())
        print("STDERR:", stderr.decode())
        sys.exit(1)

    # Test Generate Question (Mock)
    print("\nTesting POST /generate-question ...")
    payload = {
        "user_id": "test_user",
        "context": "I have experience with React and Node.js.",
        "student_profile": {"fullName": "Test User", "skills": ["React", "Node.js"]},
        "difficulty": "Intermediate",
        "sector": "General",
        "persona": "Friendly Mentor",
        "current_code": "",
        "execution_output": "",
        "current_step": 1
    }
    
    # We might expect a failure if Ollama is not running, but we want to see if the API handles it gracefully or crashes
    try:
        response = requests.post("http://127.0.0.1:8000/generate-question", json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Request failed: {e}")

finally:
    print("\nStopping AI Service...")
    process.terminate()
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()
    print("Service stopped.")
