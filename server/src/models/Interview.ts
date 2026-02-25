import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionResponse {
    question: string;
    answer: string;
    feedback?: string;
    score?: number;
}

export interface IInterview extends Document {
    studentId: mongoose.Types.ObjectId;
    date: Date;
    level: 'easy' | 'intermediate' | 'advanced';
    score: number;
    focusScore: number;
    communicationScore: number;
    technicalScore: number;
    questions: IQuestionResponse[];
}

const InterviewSchema: Schema = new Schema(
    {
        studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: Date, default: Date.now },
        level: { type: String, enum: ['easy', 'intermediate', 'advanced'], required: true },
        score: { type: Number, default: 0 },
        focusScore: { type: Number, default: 0 },
        communicationScore: { type: Number, default: 0 },
        technicalScore: { type: Number, default: 0 },
        questions: [
            {
                question: { type: String },
                answer: { type: String },
                feedback: { type: String },
                score: { type: Number },
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model<IInterview>('Interview', InterviewSchema);
