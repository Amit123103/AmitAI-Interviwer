import requests
import json
import sys

def test_generate_questions():
    url = "http://localhost:8000/generate-questions"
    payload = {
        "resume_text": "Experienced Frontend Developer with React and TypeScript skills. Worked on large scale e-commerce applications.",
        "count": 2,
        "difficulty": "Medium",
        "topic": "Arrays"
    }
    
    try:
        print(f"Sending request to {url}...")
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        data = response.json()
        print("\nResponse Status:", response.status_code)
        
        if "questions" in data:
            print(f"\nSuccessfully generated {len(data['questions'])} questions:")
            for i, q in enumerate(data['questions']):
                print(f"{i+1}. {q.get('title')} ({q.get('difficulty')})")
                print(f"   Slug: {q.get('slug')}")
                print(f"   Tags: {q.get('tags')}")
        else:
            print("\nError: 'questions' key not found in response.")
            print(json.dumps(data, indent=2))
            
    except requests.exceptions.ConnectionError:
        print("\nError: Could not connect to AI Service. Is it running on port 8000?")
    except Exception as e:
        print(f"\nAn error occurred: {e}")

if __name__ == "__main__":
    test_generate_questions()
