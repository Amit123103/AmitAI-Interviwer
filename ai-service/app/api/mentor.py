from fastapi import APIRouter
from pydantic import BaseModel
import ollama

router = APIRouter(prefix="/mentor", tags=["Mentor"])
MODEL_NAME = "llama3.1:8b"

class MentorChatRequest(BaseModel):
    convo: list
    resume_text: str = ""

@router.post("/chat")
async def mentor_chat(request: MentorChatRequest):
    try:
        system_prompt = f"""You are a dedicated AI Career Mentor. 
        CRITICAL RULES:
        1. Keep responses concise, supportive, and actionable.
        2. Provide step-by-step guidance based on the user's career goals.
        3. If the user asks for resume feedback or interview prep, refer to their CV details if provided.
        4. Maintain a premium, professional, and highly encouraging tone.
        
        USER CV/BACKGROUND:
        {request.resume_text[:2000]}"""
        
        messages = [{"role": "system", "content": system_prompt}]
        for m in request.convo:
            messages.append({"role": m.get("role", "user"), "content": m.get("content", "")})
            
        response = ollama.chat(model=MODEL_NAME, messages=messages, options={"temperature": 0.7})
        return {"reply": response['message']['content']}
    except Exception as e:
        print(f"Mentor Chat Error: {e}")
        return {"reply": "I'm having a little trouble connecting right now, but I'm here to support your career growth. Could you repeat that?"}
