
import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewSession extends Document {
    userId: mongoose.Types.ObjectId;
    problems: {
        problemId: mongoose.Types.ObjectId;
        status: 'Pending' | 'Solved' | 'Attempted';
        score: number;
    }[];
    currentProblemIndex: number;
    problemId?: mongoose.Types.ObjectId; // Deprecated
    status: 'Setup' | 'Live' | 'Completed' | 'Expired';
    startTime: Date;
    endTime: Date;
    durationMinutes: number;
    resumeText: string;
    extractedSkills: {
        languages: string[];
        frameworks: string[];
        difficulty: string;
        suggestedRole: string;
    };
    codeSnapshot: string;
    score: {
        correctness: number;
        quality: number;
        efficiency: number;
        total: number;
    };
    feedback: string;
}

const InterviewSessionSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // Support multiple problems (Standard Coding Round)
    problems: [{
        problemId: { type: Schema.Types.ObjectId, ref: 'Problem' },
        status: { type: String, enum: ['Pending', 'Solved', 'Attempted'], default: 'Pending' },
        score: { type: Number, default: 0 }
    }],
    currentProblemIndex: { type: Number, default: 0 },

    // Keep legacy single problem field for backward compatibility if needed, or deprecate
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem' },

    status: { type: String, enum: ['Setup', 'Live', 'Completed', 'Expired'], default: 'Setup' },
    startTime: { type: Date },
    endTime: { type: Date },
    durationMinutes: { type: Number, default: 45 },
    resumeText: { type: String },
    extractedSkills: {
        languages: [{ type: String }],
        frameworks: [{ type: String }],
        difficulty: { type: String, default: 'Medium' },
        suggestedRole: { type: String }
    },
    codeSnapshot: { type: String }, // Final code submitted
    score: {
        correctness: { type: Number, default: 0 },
        quality: { type: Number, default: 0 },
        efficiency: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    feedback: { type: String }
}, { timestamps: true });

export default mongoose.model<IInterviewSession>('InterviewSession', InterviewSessionSchema);
