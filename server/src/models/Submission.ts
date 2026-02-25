
import mongoose, { Document, Schema } from 'mongoose';

export interface ISubmission extends Document {
    userId: mongoose.Types.ObjectId;
    problemId: mongoose.Types.ObjectId;
    code: string;
    language: string; // 'javascript', 'python', etc.
    status: 'Pending' | 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Compilation Error' | 'Runtime Error';

    runtime?: number; // ms
    memory?: number; // KB

    testCasesPassed: number;
    totalTestCases: number;
    executionTime: number; // in ms
    memoryUsage: number; // in KB
    failureDetail?: {
        input: string;
        expectedOutput: string;
        actualOutput: string;
        error: string;
    };
    aiAnalysis?: {
        timeComplexity: string; // e.g., O(n)
        spaceComplexity: string; // e.g., O(1)
        suggestions: string[];
    };
    errorLog?: string; // For compilation/runtime errors

    createdAt: Date;
}

const SubmissionSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compilation Error', 'Runtime Error'],
        default: 'Pending'
    },

    runtime: Number,
    memory: Number,

    testCasesPassed: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    executionTime: { type: Number, default: 0 },
    memoryUsage: { type: Number, default: 0 },

    failureDetail: {
        input: String,
        expectedOutput: String,
        actualOutput: String,
        error: String
    },

    aiAnalysis: {
        timeComplexity: String,
        spaceComplexity: String,
        suggestions: [String]
    },

    errorLog: String
}, { timestamps: true });

export default mongoose.model<ISubmission>('Submission', SubmissionSchema);
