import mongoose, { Schema, Document } from 'mongoose'

export interface IQuestion extends Document {
    title: string
    type: 'technical' | 'behavioral' | 'system-design' | 'coding'
    difficulty: 'easy' | 'medium' | 'hard'
    role: string[]
    subject: string[]
    explanation: string
    sampleAnswer: string
    keyPoints: string[]
    interviewerExpectations: string[]
    commonMistakes: string[]
    relatedQuestions: mongoose.Types.ObjectId[]
    tags: string[]
    expectedKeywords: string[]
    estimatedTime?: number
    createdAt: Date
    updatedAt: Date
}

const QuestionSchema = new Schema<IQuestion>(
    {
        title: { type: String, required: true, index: true },
        type: {
            type: String,
            enum: ['technical', 'behavioral', 'system-design', 'coding'],
            required: true,
            index: true
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            required: true,
            index: true
        },
        role: [{ type: String, index: true }],
        subject: [{ type: String, index: true }],
        explanation: { type: String, required: true },
        sampleAnswer: { type: String, required: true },
        keyPoints: [String],
        interviewerExpectations: [String],
        commonMistakes: [String],
        relatedQuestions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
        tags: [{ type: String, index: true }],
        expectedKeywords: [String],
        estimatedTime: Number
    },
    { timestamps: true }
)

// Text search index for search functionality
QuestionSchema.index({ title: 'text', explanation: 'text', tags: 'text' })

// Compound indexes for common queries
QuestionSchema.index({ type: 1, difficulty: 1 })
QuestionSchema.index({ role: 1, difficulty: 1 })

export default mongoose.model<IQuestion>('Question', QuestionSchema)
