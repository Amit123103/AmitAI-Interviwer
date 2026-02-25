import mongoose from 'mongoose';

export interface IReport extends mongoose.Document {
    user: mongoose.Types.ObjectId;
    // ── New fields for Ollama AI Evaluation ──
    overallScore?: number;
    readinessLevel?: 'Beginner' | 'Developing' | 'Job Ready' | 'Interview Ready';
    interviewType?: 'Technical' | 'HR & Behavioral' | 'Mixed';
    ollamaEvaluation?: {
        relevance: number;
        technicalCorrectness: number;
        clarityStructure: number;
        confidence: number;
        communication: number;
        conceptCoverage: number;
        strengths: string[];
        improvementAreas: string[];
        aiSummary: string;
    };
    questionFeedback?: { question: string; feedback: string; score: number }[];
    // ── Existing fields ──
    scores: {
        technical: number;
        communication: number;
        confidence: number;
    };
    feedback: string;
    improvement_tips: string[];
    fillerWords: Map<string, number>;
    wpm: number;
    confidenceScore: number;
    sector: string;
    sectorMatchScore: number;
    persona: string;
    targetCompany: string;
    jobDescription: string;
    skillMatrix: {
        technical: number;
        delivery: number;
        problem_solving: number;
        situational: number;
        theoretical: number;
        confidence: number;
    };
    transcriptAnalysis: {
        role: string;
        text: string;
        confidenceScore: number;
        sentiment: string;
        feedback: string;
    }[];
    integrityScore: number;
    professionalismScore: number;
    advancedMetrics: {
        emotion: string;
        stress: string;
        trust_level: string;
    };
    voiceAnalysis: {
        question: string;
        emotion: string;
        stress_level: string;
        speaking_pace: string;
        fluency: string;
    }[];
    finalCode: string;
    codeAnalysis: string;
    videoUrl: string;
    eventLogs: {
        eventType: string;
        timestamp: number;
        metadata: any;
    }[];
    deepAnalysis: any;
    peerFeedback: {
        score: number;
        comments: string;
        reviewerId: mongoose.Types.ObjectId;
    };
    mentorComments: {
        text: string;
        mentorId: mongoose.Types.ObjectId;
        timestamp: Date;
    }[];
    behavioralDNA: {
        timestamp: number;
        emotion: string;
        intensity: number;
    }[];
    negotiationLog: {
        role: string;
        message: string;
        offer: any;
        timestamp: Date;
    }[];
    createdAt: Date;
}

const reportSchema = new mongoose.Schema<IReport>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    scores: {
        technical: Number,
        communication: Number,
        confidence: Number,
    },
    feedback: String,
    improvement_tips: [String],
    fillerWords: {
        type: Map,
        of: Number,
        default: {}
    },
    wpm: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    readinessLevel: { type: String, enum: ['Beginner', 'Developing', 'Job Ready', 'Interview Ready'], default: 'Developing' },
    interviewType: { type: String, default: 'Mixed' },
    ollamaEvaluation: {
        relevance: Number,
        technicalCorrectness: Number,
        clarityStructure: Number,
        confidence: Number,
        communication: Number,
        conceptCoverage: Number,
        strengths: [String],
        improvementAreas: [String],
        aiSummary: String
    },
    questionFeedback: [{ question: String, feedback: String, score: Number }],
    sector: { type: String, default: 'General' },
    sectorMatchScore: { type: Number, default: 0 },
    persona: { type: String, default: 'Friendly Mentor' },
    targetCompany: String,
    jobDescription: String,
    skillMatrix: {
        technical: Number,
        delivery: Number,
        problem_solving: Number,
        situational: Number,
        theoretical: Number,
        confidence: Number
    },
    transcriptAnalysis: [{
        role: String,
        text: String,
        confidenceScore: Number,
        sentiment: String,
        feedback: String
    }],
    integrityScore: { type: Number, default: 100 },
    professionalismScore: { type: Number, default: 10 },
    advancedMetrics: {
        emotion: String,
        stress: String,
        trust_level: String
    },
    voiceAnalysis: [{
        question: String,
        emotion: String,
        stress_level: String,
        speaking_pace: String,
        fluency: String
    }],
    finalCode: String,
    codeAnalysis: String,
    videoUrl: String,
    eventLogs: [{
        eventType: String,
        timestamp: Number,
        metadata: mongoose.Schema.Types.Mixed
    }],
    deepAnalysis: mongoose.Schema.Types.Mixed,
    peerFeedback: {
        score: Number,
        comments: String,
        reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    mentorComments: [{
        text: String,
        mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now }
    }],
    behavioralDNA: [{
        timestamp: Number,
        emotion: String,
        intensity: Number
    }],
    negotiationLog: [{
        role: String,
        message: String,
        offer: mongoose.Schema.Types.Mixed,
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', reportSchema);
export default Report;
