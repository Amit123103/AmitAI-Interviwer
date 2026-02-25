import axios from 'axios'

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b'
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

// ─── Company Interview Patterns (RAG Knowledge Base) ────────────────────────
const COMPANY_PATTERNS: Record<string, { style: string; focusAreas: string[]; behavioralRatio: number }> = {
    Google: { style: 'structured problem-solving, emphasis on algorithms and scalability', focusAreas: ['algorithms', 'system design', 'distributed systems', 'leadership'], behavioralRatio: 0.25 },
    Amazon: { style: 'Leadership Principles-driven, STAR method expected', focusAreas: ['leadership principles', 'customer obsession', 'system design', 'data structures'], behavioralRatio: 0.5 },
    Microsoft: { style: 'culture fit emphasis, growth mindset, collaborative problem solving', focusAreas: ['coding', 'design patterns', 'teamwork', 'learning agility'], behavioralRatio: 0.35 },
    Meta: { style: 'fast-paced, product-oriented, cross-functional collaboration', focusAreas: ['coding', 'product sense', 'execution', 'systems'], behavioralRatio: 0.3 },
    Apple: { style: 'detail-oriented, quality focus, consumer empathy', focusAreas: ['design thinking', 'technical depth', 'craftsmanship', 'customer empathy'], behavioralRatio: 0.3 },
    Flipkart: { style: 'e-commerce scale problems, strong CS fundamentals', focusAreas: ['algorithms', 'distributed systems', 'product thinking'], behavioralRatio: 0.3 },
    Infosys: { style: 'aptitude + technical + HR rounds', focusAreas: ['programming basics', 'OOPS', 'DBMS', 'general HR'], behavioralRatio: 0.45 },
    TCS: { style: 'standard aptitude, technical foundations, HR', focusAreas: ['verbal', 'reasoning', 'programming concepts', 'HR'], behavioralRatio: 0.5 },
    Wipro: { style: 'aptitude + technical + managerial', focusAreas: ['core CS', 'reasoning', 'communication', 'teamwork'], behavioralRatio: 0.4 },
    General: { style: 'balanced technical and behavioral', focusAreas: ['core skills', 'communication', 'problem solving', 'teamwork'], behavioralRatio: 0.4 },
}

// ─── Skill Extraction from CV ────────────────────────────────────────────────
const TECH_KEYWORDS: Record<string, string> = {
    // Languages
    python: 'Python', javascript: 'JavaScript', typescript: 'TypeScript',
    java: 'Java', 'c++': 'C++', 'c#': 'C#', golang: 'Go', rust: 'Rust',
    kotlin: 'Kotlin', swift: 'Swift', php: 'PHP', ruby: 'Ruby', scala: 'Scala',
    // Frameworks
    react: 'React', node: 'Node.js', express: 'Express', nextjs: 'Next.js',
    django: 'Django', flask: 'Flask', spring: 'Spring Boot', angular: 'Angular',
    vue: 'Vue.js', tensorflow: 'TensorFlow', pytorch: 'PyTorch', keras: 'Keras',
    // Infrastructure / Tools
    docker: 'Docker', kubernetes: 'Kubernetes', aws: 'AWS', gcp: 'GCP',
    azure: 'Azure', git: 'Git', graphql: 'GraphQL', redis: 'Redis',
    mongodb: 'MongoDB', mysql: 'MySQL', postgresql: 'PostgreSQL', kafka: 'Kafka',
    // Domain Keywords
    'machine learning': 'Machine Learning', 'deep learning': 'Deep Learning',
    'data science': 'Data Science', nlp: 'NLP', 'computer vision': 'Computer Vision',
    blockchain: 'Blockchain', cybersecurity: 'Cybersecurity', devops: 'DevOps',
    'full stack': 'Full Stack', backend: 'Backend', frontend: 'Frontend'
}

const EXPERIENCE_SIGNALS: Record<string, string> = {
    'senior': 'Senior', 'lead': 'Lead', 'architect': 'Architect', 'principal': 'Principal',
    'intern': 'Intern', 'junior': 'Junior', 'fresher': 'Entry Level', 'entry': 'Entry Level',
    'manager': 'Manager', 'director': 'Director'
}

export interface CVInsights {
    skills: string[]
    experienceLevel: string
    hasProjects: boolean
    hasCertifications: boolean
    keyTopics: string[]
}

export interface RAGContext {
    studentName: string
    course: string
    department: string
    dreamCompany: string
    jobRole: string
    interviewType: 'Technical' | 'HR & Behavioral' | 'Mixed'
    difficulty: string
    persona: string
    cvInsights: CVInsights
    companyStyle: string
    companyFocusAreas: string[]
    jdKeywords: string[]
    contextSummary: string
}

// ─── CV Parser ───────────────────────────────────────────────────────────────
export function extractCVInsights(cvText: string): CVInsights {
    const lower = cvText.toLowerCase()

    const skills = Object.entries(TECH_KEYWORDS)
        .filter(([key]) => lower.includes(key))
        .map(([, label]) => label)
        .slice(0, 15)

    const experienceEntry = Object.entries(EXPERIENCE_SIGNALS).find(([sig]) => lower.includes(sig))
    const experienceLevel = experienceEntry ? experienceEntry[1] : 'Mid-level'

    const hasProjects = lower.includes('project') || lower.includes('built') || lower.includes('developed')
    const hasCertifications = lower.includes('certif') || lower.includes('aws ') || lower.includes('gcp ')

    return {
        skills,
        experienceLevel,
        hasProjects,
        hasCertifications,
        keyTopics: skills.slice(0, 6)
    }
}

// ─── RAG Context Builder (Enhanced) ──────────────────────────────────────────
export async function buildRAGContext(params: {
    studentName: string
    course: string
    department: string
    dreamCompany: string
    jobRole: string
    interviewType: 'Technical' | 'HR & Behavioral' | 'Mixed'
    difficulty: string
    persona: string
    cvText: string
    jobDescription: string
}): Promise<RAGContext> {
    const cvInsights = extractCVInsights(params.cvText || '')

    // Attempt deep analysis from Python AI Service
    let deepAnalysis: any = null
    try {
        const aiRes = await axios.post(`${AI_SERVICE_URL}/resume/analyze`, {
            resume_text: params.cvText,
            job_role: params.jobRole,
            target_company: params.dreamCompany
        }, { timeout: 15000 });
        deepAnalysis = aiRes.data
    } catch (err) {
        console.warn('[ollamaService] Python Deep Analysis failed, using local extraction')
    }

    const companyKey = Object.keys(COMPANY_PATTERNS).find(k =>
        params.dreamCompany?.toLowerCase().includes(k.toLowerCase())
    ) || 'General'
    const company = COMPANY_PATTERNS[companyKey]

    const jdKeywords = params.jobDescription
        ? params.jobDescription.toLowerCase().match(/\b[a-z]{4,}\b/g)?.filter((w, i, arr) =>
            arr.indexOf(w) === i && TECH_KEYWORDS[w]
        ).map(w => TECH_KEYWORDS[w]).slice(0, 8) || []
        : []

    const allSkills = deepAnalysis?.key_skills?.top_technical || [...new Set([...cvInsights.skills, ...jdKeywords])]

    // Update cvInsights with deep analysis if available
    if (deepAnalysis) {
        cvInsights.skills = allSkills;
        cvInsights.experienceLevel = deepAnalysis.experience_level?.level || cvInsights.experienceLevel;
        cvInsights.keyTopics = deepAnalysis.potential_questions?.technical_topics || cvInsights.keyTopics;
    }

    const contextSummary = `
Student: ${params.studentName}, ${params.course}, ${params.department}
Experience Level: ${cvInsights.experienceLevel}
Technical Skills: ${allSkills.join(', ') || 'General CS fundamentals'}
Dream Company: ${params.dreamCompany || 'Not specified'}
Job Role: ${params.jobRole || 'Software Engineer'}
Interview Type: ${params.interviewType}
Difficulty: ${params.difficulty}
Interviewer Persona: ${params.persona}
Company Interview Style: ${company.style}
Key Focus Areas: ${company.focusAreas.join(', ')}
Has Projects: ${cvInsights.hasProjects}
Has Certifications: ${cvInsights.hasCertifications}
${deepAnalysis?.strengths ? `Resume Strengths: ${deepAnalysis.strengths.slice(0, 3).join(', ')}` : ''}
${params.jobDescription ? `Job Description Highlights: ${params.jobDescription.slice(0, 300)}` : ''}
`.trim()

    return {
        studentName: params.studentName,
        course: params.course,
        department: params.department,
        dreamCompany: params.dreamCompany,
        jobRole: params.jobRole,
        interviewType: params.interviewType,
        difficulty: params.difficulty,
        persona: params.persona,
        cvInsights,
        companyStyle: company.style,
        companyFocusAreas: company.focusAreas,
        jdKeywords,
        contextSummary
    }
}

// ─── Question Generation ─────────────────────────────────────────────────────
const FALLBACK_QUESTIONS: Record<string, string[]> = {
    Technical: [
        'Explain the difference between REST and GraphQL APIs. When would you use each?',
        'How would you design a URL shortening service like bit.ly? Walk me through the architecture.',
        'What is the time complexity of quicksort in the worst case and how can it be improved?',
        'Explain the concept of database indexing and when you would avoid using an index.',
        'What are the SOLID principles? Give an example of applying one in your code.',
        'How does garbage collection work in [your primary language]?',
        'Describe a challenging bug you fixed. What was the root cause and your debugging process?',
        'What is a race condition and how do you prevent it?',
        'Explain microservices vs monolith tradeoffs for a high-traffic application.',
        'How would you implement caching in a distributed system?'
    ],
    'HR & Behavioral': [
        'Tell me about a project you were most proud of. What was your specific contribution?',
        'Describe a time you had a conflict with a team member. How did you resolve it?',
        'Tell me about a time you failed on a project. What did you learn from it?',
        'Where do you see yourself in 5 years in your career?',
        'Why do you want to work at this company specifically?',
        'Describe a situation where you had to meet a tight deadline under pressure.',
        'Tell me about a time you had to learn something new quickly for a project.',
        'How do you prioritize tasks when everything seems urgent?',
        'Describe a time you took initiative beyond your regular responsibilities.',
        'What feedback have you received from managers or peers that changed how you work?'
    ],
    Mixed: [
        'Tell me about yourself and your technical background.',
        'What is the most complex system you have built and what were the key design decisions?',
        'Describe a time you disagreed with a technical decision. What did you do?',
        'How do you approach learning a new technology? Give a recent example.',
        'Explain a data structure you used recently and why you chose it.',
        'Tell me about a time you improved a process or system\'s performance significantly.',
        'How do you handle technical debt in a fast-moving project?',
        'What makes a good code review? How do you give feedback to peers?',
        'Describe your approach to testing and quality assurance.',
        'Where do you think the biggest opportunities are in tech right now and why?'
    ]
};

// ─── Question Generation (Enhanced) ───────────────────────────────────────────
export async function generateInterviewQuestions(
    context: RAGContext,
    count: number = 10
): Promise<any[]> { // Now returns rich objects if available
    try {
        // Attempt to call the Python AI Service for high-quality personalized questions
        const aiRes = await axios.post(`${AI_SERVICE_URL}/resume/generate-questions`, {
            resume_text: context.contextSummary,
            count: count,
            difficulty: context.difficulty,
            sector: context.cvInsights.skills[0] || 'General',
            persona: context.persona,
            interview_type: context.interviewType,
            job_description: context.jdKeywords.join(', ')
        }, { timeout: 60000 });

        if (aiRes.data?.questions_rich && aiRes.data.questions_rich.length > 0) {
            return aiRes.data.questions_rich;
        }

        // Backward compatibility for flat questions
        if (aiRes.data?.questions && aiRes.data.questions.length > 0) {
            return aiRes.data.questions;
        }
    } catch (err) {
        console.warn('[ollamaService] Python AI Question gen failed, falling back to local Ollama');
    }

    const typeMap: Record<string, string> = {
        'Technical': 'technical and problem-solving',
        'HR & Behavioral': 'behavioral and situational (use STAR method topics)',
        'Mixed': 'a balanced mix of technical, behavioral, and situational'
    }

    const prompt = `You are a professional interviewer for ${context.dreamCompany || 'a top tech company'}.

Context about the candidate:
${context.contextSummary}

Generate exactly ${count} interview questions. The questions should be ${typeMap[context.interviewType] || 'mixed'} in nature.
Difficulty level: ${context.difficulty}.
Interviewer persona: ${context.persona}.

Rules:
- Make questions highly specific to the candidate's background and skills
- For technical: focus on ${context.companyFocusAreas.join(', ')}
- For behavioral: use real workplace scenarios
- Questions should progress in difficulty
- Return ONLY a numbered list of questions, no preamble or explanation

Questions:`

    try {
        const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
            model: OLLAMA_MODEL,
            prompt,
            stream: false,
            options: { temperature: 0.1, num_predict: 800, num_ctx: 4096 }
        }, { timeout: 30000 })

        const raw: string = response.data.response || ''
        const lines = raw.split('\n')
            .map((l: string) => l.replace(/^\d+[\.\)]\s*/, '').trim())
            .filter((l: string) => l.length > 20)
            .slice(0, count)

        if (lines.length >= 3) return lines

        // Fallback if parsing fails
        return (FALLBACK_QUESTIONS[context.interviewType] || FALLBACK_QUESTIONS.Mixed).slice(0, count)
    } catch (err) {
        console.warn('[ollamaService] Ollama unavailable, using fallback questions:', (err as any).message)
        return (FALLBACK_QUESTIONS[context.interviewType] || FALLBACK_QUESTIONS.Mixed).slice(0, count)
    }
}

// ─── Transcript Evaluation ───────────────────────────────────────────────────
export interface EvaluationMetrics {
    technical: number
    communication: number
    confidence: number
    problemSolving: number
    situational: number
    theoretical: number
    overallScore: number
    readinessLevel: 'Beginner' | 'Developing' | 'Job Ready' | 'Interview Ready'
    strengths: string[]
    improvementAreas: string[]
    aiSummary: string
    questionFeedback: { question: string; feedback: string; score: number }[]
}

const WEIGHTS = {
    technical: 0.25,
    communication: 0.15,
    confidence: 0.15,
    problemSolving: 0.15,
    situational: 0.15,
    theoretical: 0.15
}

function getReadinessLevel(score: number): EvaluationMetrics['readinessLevel'] {
    if (score >= 8) return 'Interview Ready'
    if (score >= 6) return 'Job Ready'
    if (score >= 4) return 'Developing'
    return 'Beginner'
}

export async function evaluateInterview(
    transcript: { role: 'ai' | 'user'; text: string }[],
    context: RAGContext
): Promise<EvaluationMetrics> {
    const userResponses = transcript.filter(t => t.role === 'user')
    const aiQuestions = transcript.filter(t => t.role === 'ai' && !t.text.includes('Great') && !t.text.includes('Thank you'))

    if (userResponses.length === 0) {
        return buildFallbackEvaluation()
    }

    const transcriptText = transcript
        .map(t => `${t.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${t.text}`)
        .join('\n')

    const prompt = `You are a professional interview evaluator. Evaluate this interview transcript objectively.

Candidate Background:
${context.contextSummary}

Full Transcript:
${transcriptText.slice(0, 3000)}

Evaluate the candidate on these 6 dimensions (score each 1-10):
1. Technical (depth of technical answers)
2. Communication (articulation, structure, coherence)
3. Confidence (assertiveness, conviction, delivery)
4. Problem Solving (approach, logic, creativity)
5. Situational (handling specific scenarios, behavioral examples)
6. Theoretical (understanding of core concepts and principles)

Also provide:
- 3 specific strengths shown
- 3 specific improvement areas with actionable advice
- 2-sentence overall summary

Respond in this exact JSON format:
{
  "technical": 7,
  "communication": 6,
  "confidence": 8,
  "problemSolving": 7,
  "situational": 6,
  "theoretical": 8,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvementAreas": ["improvement 1", "improvement 2", "improvement 3"],
  "aiSummary": "Overall summary here."
} `

    try {
        const aiRes = await axios.post(`${AI_SERVICE_URL}/interview/evaluate-full`, {
            transcript,
            student_profile: context,
            sector: context.department
        }, { timeout: 90000 });

        const report = aiRes.data;
        return {
            ...report.metrics,
            overallScore: report.overall_score,
            readinessLevel: report.readiness_level,
            strengths: report.strengths || [],
            improvementAreas: report.improvement_areas || [],
            aiSummary: report.executive_summary || 'Interview completed.',
            questionFeedback: report.question_feedback || []
        };
    } catch (err) {
        console.warn('[ollamaService] Evaluation fallback triggered:', (err as any).message)
        return buildFallbackEvaluation(userResponses)
    }
}

function clamp(n: number): number {
    return Math.min(10, Math.max(1, Math.round(n)))
}

function buildFallbackEvaluation(userResponses?: { role: string; text: string }[]): EvaluationMetrics {
    const count = userResponses?.length || 0
    const base = count > 5 ? 6 : count > 2 ? 5 : 3

    const metrics = {
        technical: base,
        communication: Math.min(10, base + 1),
        confidence: base,
        problemSolving: base,
        situational: base,
        theoretical: base,
    }

    const overall = +(
        metrics.technical * WEIGHTS.technical +
        metrics.communication * WEIGHTS.communication +
        metrics.confidence * WEIGHTS.confidence +
        metrics.problemSolving * WEIGHTS.problemSolving +
        metrics.situational * WEIGHTS.situational +
        metrics.theoretical * WEIGHTS.theoretical
    ).toFixed(1)

    return {
        ...metrics,
        overallScore: overall,
        readinessLevel: getReadinessLevel(overall),
        strengths: ['Completed the interview session', 'Demonstrated willingness to engage', 'Showed interest in the role'],
        improvementAreas: ['Practice answering with the STAR method', 'Expand on technical examples with concrete projects', 'Work on response depth and specificity'],
        aiSummary: 'The interview was completed. AI-powered evaluation will be available when the Ollama service is online.',
        questionFeedback: []
    }
}

// ─── Instant Chat Generation ( AI Interview ) ───────────────────────────────────
export async function generateInstantChatResponse(
    convo: { role: 'user' | 'assistant'; text: string }[],
    cvText: string = ''
): Promise<string> {
    const systemPrompt = `You are a warm, professional job interviewer named "Sarah".
CRITICAL RULES:
1. Keep every response to 1-2 SHORT sentences only.
2. NO bullet points, NO lists, NO asterisks, NO markdown.
3. Natural conversational language.
4. Acknowledge the candidate's answer in ONE sentence, then ask ONE question.
5. NEVER ask the same question twice. Look at the history and MOVE FORWARD.
6. MANDATORY: Base EVERY question directly on their CV details. If they have a project, ask about it. If they have a skill, ask for an example.
7. Progress the interview: Start with an introduction, then dive into technical/background questions from the CV, and conclude naturally.
8. If this is the start (convo is empty), greet them and ask the first CV-based question.
9. If there are more than 18 turns in the history, wrap up the interview and wish them luck.

CV CONTENT FOR CONTEXT:
${cvText.slice(0, 3000)}`

    const messages = convo.map(m => ({
        role: m.role,
        content: m.text
    }))

    // Log for debugging
    console.log(`[AI Interview] Context length: ${cvText.length}, History turns: ${convo.length}, Using Model: ${OLLAMA_MODEL}`);

    try {
        const aiRes = await axios.post(`${AI_SERVICE_URL}/interview/sarah-chat`, {
            convo,
            resume_text: cvText
        }, { timeout: 35000 });

        const reply = aiRes.data.reply || "That's interesting! Tell me more about that.";
        console.log(`[AI Interview] Reply: ${reply.slice(0, 50)}...`);
        return reply;
    } catch (err: any) {
        console.warn('[ollamaService] Instant chat failed:', err.message)
        // Try fallback to just llama3 if llama3.1:8b fails
        if (err.response?.status === 404) {
            console.log("[AI Interview] Model not found, trying common fallback names...");
            // Silently return a more useful fallback that moves the conversation if possible
            return "That's quite an interesting project. Can you tell me more about the technical challenges you faced in your most recent role?"
        }
        return "I see. Could you elaborate more on your experience in that area as mentioned in your resume?"
    }
}
