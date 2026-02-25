from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.services.resume_parser import parse_resume
from app.services.resume_intelligence import ResumeIntelligence
from app.services.vector_store import vector_manager
import ollama
import json

router = APIRouter(prefix="/resume", tags=["Resume"])
resume_intel = ResumeIntelligence()
MODEL_NAME = "llama3.1:8b"

class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    job_role: str = ""
    target_company: str = ""

@router.post("/parse")
async def parse_resume_endpoint(file: UploadFile = File(...)):
    try:
        # 1. Extract text from file
        resume_text = await parse_resume(file)
        
        # 2. Initialize Vector Store for RAG
        vector_manager.create_store_from_text(resume_text, file.filename)
        
        # 3. Analyze with LLM (vitals only for speed)
        prompt = f"""
        Extract the following vitals from this resume text. 
        Return ONLY valid JSON.
        
        REQUIRED FIELDS:
        - personalInfo (name, email)
        - skills (top 15 tech skills)
        - experienceLevel (Junior, Mid, or Senior)
        - suggestedRole (e.g., Backend Engineer)
        - summary (2 sentence professional overview)
        
        RESUME TEXT:
        {resume_text[:3000]}
        """
        
        response = ollama.chat(model=MODEL_NAME, messages=[
            {"role": "system", "content": "You are a fast Resume Parser. Output JSON only."},
            {"role": "user", "content": prompt}
        ], format='json', options={"num_predict": 250, "temperature": 0.1})
        
        analysis = json.loads(response['message']['content'])
        return {**analysis, "resume_text": resume_text}
    except Exception as e:
        print(f"Error in parse-resume: {e}")
        return {"error": str(e)}

@router.post("/analyze")
async def analyze_resume_deep(request: ResumeAnalysisRequest):
    try:
        # Use RAG to get relevant context if vector store is initialized
        context = ""
        if vector_manager.vector_db:
            relevant_docs = vector_manager.query("technical projects, experience, education", k=5)
            context = "\n".join([doc.page_content for doc in relevant_docs])
        else:
            context = request.resume_text[:4000]

        prompt = f"""
        Analyze the following resume segments for a {request.job_role or 'software engineering'} role.
        Provide a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) and identify missing ATS keywords.
        
        CONTEXT SEGMENTS:
        {context}
        
        Return a JSON object with:
        {{
            "strengths": ["List of strengths"],
            "weaknesses": ["List of weaknesses"],
            "missingKeywords": ["List of missing important keywords for tech roles"],
            "summary": "Brief professional summary feedback"
        }}
        """
        
        response = ollama.chat(model=MODEL_NAME, messages=[
            {"role": "system", "content": "You are an Expert Resume Reviewer and Technical Recruiter. Output valid JSON only."},
            {"role": "user", "content": prompt}
        ], format='json')
        
        return json.loads(response['message']['content'])
    except Exception as e:
        print(f"Error in analyze-resume: {e}")
        return {"error": str(e)}

@router.post("/generate-questions")
async def generate_questions(request: dict):
    try:
        resume_text = request.get("resume_text", "")
        count = request.get("count", 3)
        difficulty = request.get("difficulty", "Medium")
        sector = request.get("sector", "General")
        
        # Perform deep analysis for question generation
        analysis = resume_intel.analyze_resume_deep(resume_text, job_role=sector)
        
        # Generate questions using the analysis
        questions = resume_intel.generate_personalized_questions(
            resume_analysis=analysis,
            total_questions=count,
            difficulty=difficulty,
            sector=sector
        )
        return questions
    except Exception as e:
        print(f"Error in generate-questions: {e}")
        return {"error": str(e)}
