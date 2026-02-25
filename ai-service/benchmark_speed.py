import requests
import time
import json
import os

AI_URL = "http://127.0.0.1:8000"

def benchmark_parse():
    print("--- Benchmarking CV Parsing ---")
    filename = "test_resume.txt"
    dummy_text = "John Doe - Senior Software Engineer. Experience in Python, React, and Node.js. Worked on Scalable Systems at Tech Corp."
    
    with open(filename, "w") as f:
        f.write(dummy_text)
    
    t0 = time.time()
    with open(filename, 'rb') as f:
        files = {'file': (filename, f, 'text/plain')}
        res = requests.post(f"{AI_URL}/parse-resume", files=files)
    t1 = time.time()
    
    print(f"Status: {res.status_code}")
    print(f"Parsing latency: {t1 - t0:.2f}s")
    if res.status_code == 200:
        print("Response structure looks good.")
    os.remove(filename)
    return t1 - t0

def benchmark_gen():
    print("\n--- Benchmarking Question Generation ---")
    payload = {
        "resume_text": "John Doe - Senior Software Engineer. Experience in Python, React, and Node.js. Projects: Distributed Cache System, Real-time Analytics Dashboard.",
        "job_role": "Senior Backend Developer",
        "total_questions": 5,
        "difficulty": "Hard",
        "sector": "Fintech",
        "persona": "Strict Lead"
    }
    
    t0 = time.time()
    res = requests.post(f"{AI_URL}/generate-interview-plan", json=payload)
    t1 = time.time()
    
    print(f"Status: {res.status_code}")
    print(f"Generation latency: {t1 - t0:.2f}s")
    if res.status_code == 200:
        data = res.json()
        print(f"Questions generated: {len(data.get('questions', []))}")
        print(f"First Question: {data['questions'][0][:100]}...")
    return t1 - t0

if __name__ == "__main__":
    try:
        parse_time = benchmark_parse()
        gen_time = benchmark_gen()
        print("\n--- RESULTS ---")
        print(f"CV Parsing: {parse_time:.2f}s")
        print(f"Question Gen: {gen_time:.2f}s")
        print(f"Total Turnaround: {parse_time + gen_time:.2f}s")
    except Exception as e:
        print(f"Benchmark failed: {e}")
