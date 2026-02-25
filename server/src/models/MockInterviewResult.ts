import mongoose, { Schema, Document } from 'mongoose'

export interface IMockInterviewResult extends Document {
    userId: mongoose.Types.ObjectId
    companyId: mongoose.Types.ObjectId
    rounds: Array<{
        roundNumber: number
        roundName: string
        questions: Array<{
            questionText: string
            answer: string
            score: number
            feedback: string
        }>
        overallScore: number
        completedAt: Date
    }>
    overallScore?: number
    feedback: string[]
    strengths: string[]
    weaknesses: string[]
    passed?: boolean
    completedAt?: Date
    createdAt: Date
    updatedAt: Date
}

const MockInterviewResultSchema = new Schema<IMockInterviewResult>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        companyId: {
            type: Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
            index: true
        },
        rounds: [{
            roundNumber: Number,
            roundName: String,
            questions: [{
                questionText: String,
                answer: String,
                score: Number,
                feedback: String
            }],
            overallScore: Number,
            completedAt: Date
        }],
        overallScore: { type: Number, min: 0, max: 100 },
        feedback: [String],
        strengths: [String],
        weaknesses: [String],
        passed: Boolean,
        completedAt: Date
    },
    { timestamps: true }
)

// Compound index for user-company mock interviews
MockInterviewResultSchema.index({ userId: 1, companyId: 1, completedAt: -1 })

export default mongoose.model<IMockInterviewResult>('MockInterviewResult', MockInterviewResultSchema)
