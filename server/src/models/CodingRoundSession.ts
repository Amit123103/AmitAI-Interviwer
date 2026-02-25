import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentDetails {
    name: string;
    course: string;
    department: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface ICVData {
    languages: string[];
    frameworks: string[];
    tools: string[];
    domains: string[];
    experienceLevel: 'Entry' | 'Mid' | 'Senior';
    rawText?: string;
}

export interface ISessionConfig {
    numQuestions: number;
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Auto';
    language: 'javascript' | 'python' | 'java' | 'cpp';
    topic?: string;
}

export interface IQuestionAttempt {
    problemId: mongoose.Types.ObjectId;
    slug: string;
    title: string;
    difficulty: string;
    status: 'pending' | 'skipped' | 'attempted' | 'accepted' | 'wrong';
    code?: string;
    language?: string;
    timeTakenSeconds?: number;
    submissionResult?: {
        passed: boolean;
        runtime?: number;
        memory?: number;
        testCasesPassed?: number;
        totalTestCases?: number;
        error?: string;
    };
    aiCodeFeedback?: string;
    correctApproach?: string;
    improvementTips?: string;
}

export interface IEvaluation {
    overallScore: number;      // 0-100
    accuracyPercent: number;
    questionsSolved: number;
    averageRuntime?: number;
    readinessLevel: 'Beginner' | 'Developing' | 'Job Ready' | 'Interview Ready';
    metrics: {
        technicalAccuracy: number;   // 1-10
        efficiency: number;
        codeQuality: number;
        problemSolving: number;
        timeManagement: number;
        debuggingAbility: number;
    };
    aiSummary?: string;
}

export interface ICodingRoundSession extends Document {
    userId: mongoose.Types.ObjectId;
    studentDetails: IStudentDetails;
    cvData?: ICVData;
    config: ISessionConfig;
    questions: IQuestionAttempt[];
    currentQuestionIndex: number;
    startedAt?: Date;
    finishedAt?: Date;
    totalTimeTakenSeconds?: number;
    evaluation?: IEvaluation;
    status: 'setup' | 'config' | 'active' | 'completed';
    createdAt: Date;
    updatedAt: Date;
}

const SessionSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentDetails: {
        name: { type: String, required: true },
        course: { type: String, required: true },
        department: { type: String, required: true },
        level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
    },
    cvData: {
        languages: [String],
        frameworks: [String],
        tools: [String],
        domains: [String],
        experienceLevel: { type: String, enum: ['Entry', 'Mid', 'Senior'], default: 'Entry' },
        rawText: String,
    },
    config: {
        numQuestions: { type: Number, default: 5, min: 1, max: 10 },
        difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Auto'], default: 'Auto' },
        language: { type: String, enum: ['javascript', 'python', 'java', 'cpp'], default: 'python' },
        topic: String,
    },
    questions: [{
        problemId: { type: Schema.Types.ObjectId, ref: 'Problem' },
        slug: String,
        title: String,
        difficulty: String,
        status: { type: String, enum: ['pending', 'skipped', 'attempted', 'accepted', 'wrong'], default: 'pending' },
        code: String,
        language: String,
        timeTakenSeconds: Number,
        submissionResult: {
            passed: Boolean,
            runtime: Number,
            memory: Number,
            testCasesPassed: Number,
            totalTestCases: Number,
            error: String,
        },
        aiCodeFeedback: String,
        correctApproach: String,
        improvementTips: String,
    }],
    currentQuestionIndex: { type: Number, default: 0 },
    startedAt: Date,
    finishedAt: Date,
    totalTimeTakenSeconds: Number,
    evaluation: {
        overallScore: Number,
        accuracyPercent: Number,
        questionsSolved: Number,
        averageRuntime: Number,
        readinessLevel: { type: String, enum: ['Beginner', 'Developing', 'Job Ready', 'Interview Ready'] },
        metrics: {
            technicalAccuracy: Number,
            efficiency: Number,
            codeQuality: Number,
            problemSolving: Number,
            timeManagement: Number,
            debuggingAbility: Number,
        },
        aiSummary: String,
    },
    status: { type: String, enum: ['setup', 'config', 'active', 'completed'], default: 'setup' },
}, { timestamps: true });

export default mongoose.model<ICodingRoundSession>('CodingRoundSession', SessionSchema);
