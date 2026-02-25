
import mongoose, { Document, Schema } from 'mongoose';

export interface ITestCase {
    input: string;
    output: string;
    isHidden: boolean; // True for submission tests, False for example tests
    explanation?: string;
}

export interface IProblem extends Document {
    slug: string; // url-friendly-id
    title: string;
    description: string; // Markdown
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: string; // e.g., 'Arrays', 'DP', 'Graphs'
    tags: string[];
    companies: string[]; // e.g., 'Google', 'Amazon'

    starterCode: {
        javascript?: string;
        python?: string;
        java?: string;
        cpp?: string;
    };

    testCases: ITestCase[];

    timeLimit: number; // in milliseconds (e.g., 2000)
    memoryLimit: number; // in MB (e.g., 256)

    constraints: string[];
    examples: {
        input: string;
        output: string;
        explanation?: string;
    }[];

    stats: {
        accepted: number;
        submissions: number;
        acceptanceRate: number;
    };

    createdAt: Date;
    updatedAt: Date;
}

const ProblemSchema: Schema = new Schema({
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true, index: true },
    category: { type: String, required: true, index: true },
    tags: [{ type: String, index: true }],
    companies: [{ type: String, index: true }],

    starterCode: {
        javascript: String,
        python: String,
        java: String,
        cpp: String
    },

    testCases: [{
        input: String,
        output: String,
        isHidden: { type: Boolean, default: false },
        explanation: String
    }],

    timeLimit: { type: Number, default: 2000 }, // Default 2s
    memoryLimit: { type: Number, default: 256 }, // Default 256MB

    constraints: [String],
    examples: [{
        input: String,
        output: String,
        explanation: String
    }],

    stats: {
        accepted: { type: Number, default: 0 },
        submissions: { type: Number, default: 0 },
        acceptanceRate: { type: Number, default: 0 }
    },

    isGenerated: { type: Boolean, default: false },
    sourceSessionId: { type: Schema.Types.ObjectId, ref: 'InterviewSession' }
}, { timestamps: true });

export default mongoose.model<IProblem>('Problem', ProblemSchema);
