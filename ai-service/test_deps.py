import asyncio
import edge_tts
import ollama
import io

async def test_tts():
    print("Testing Edge TTS...")
    try:
        communicate = edge_tts.Communicate("Hello testing 1 2 3", "en-US-EmmaNeural")
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                print("TTS Audio chunk received!")
                break
        print("TTS Success!")
    except Exception as e:
        print(f"TTS Failed: {e}")

def test_ollama():
    print("\nTesting Ollama (llama3.1:8b)...")
    try:
        res = ollama.chat(model='llama3.1:8b', messages=[{'role': 'user', 'content': 'hi'}])
        print(f"Ollama Success: {res['message']['content'][:20]}...")
    except Exception as e:
        print(f"Ollama Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_tts())
    test_ollama()
