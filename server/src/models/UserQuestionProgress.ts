import mongoose, { Schema, Document } from 'mongoose'

export interface IUserQuestionProgress extends Document {
    userId: mongoose.Types.ObjectId
    questionId: mongoose.Types.ObjectId
    bookmarked: boolean
    practiced: boolean
    mastered: boolean
    attempts: number
    lastPracticed?: Date
    averageScore?: number
    bestScore?: number
    practiceHistory: Array<{
        date: Date
        score: number
        duration: number
        feedback?: string
    }>
    createdAt: Date
    updatedAt: Date
}

const UserQuestionProgressSchema = new Schema<IUserQuestionProgress>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        questionId: {
            type: Schema.Types.ObjectId,
            ref: 'Question',
            required: true,
            index: true
        },
        bookmarked: { type: Boolean, default: false },
        practiced: { type: Boolean, default: false },
        mastered: { type: Boolean, default: false },
        attempts: { type: Number, default: 0 },
        lastPracticed: Date,
        averageScore: { type: Number, min: 0, max: 100 },
        bestScore: { type: Number, min: 0, max: 100 },
        practiceHistory: [{
            date: Date,
            score: Number,
            duration: Number,
            feedback: String
        }]
    },
    { timestamps: true }
)

// Compound unique index to ensure one progress record per user-question pair
UserQuestionProgressSchema.index({ userId: 1, questionId: 1 }, { unique: true })

// Index for bookmarked questions
UserQuestionProgressSchema.index({ userId: 1, bookmarked: 1 })

export default mongoose.model<IUserQuestionProgress>('UserQuestionProgress', UserQuestionProgressSchema)
