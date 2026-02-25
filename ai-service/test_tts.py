import edge_tts, asyncio, io, base64, time

async def test():
    start = time.time()
    text = "Hello! Welcome to your Technical interview. Let's get started!"
    print(f"Testing edge_tts with text: {text}")
    
    communicate = edge_tts.Communicate(text, "en-US-EmmaNeural")
    mp3_fp = io.BytesIO()
    
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            mp3_fp.write(chunk["data"])
    
    audio_bytes = mp3_fp.getvalue()
    audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
    
    elapsed = time.time() - start
    print(f"Done in {elapsed:.1f}s")
    print(f"Audio: {len(audio_bytes)} bytes, base64: {len(audio_b64)} chars")

asyncio.run(test())
