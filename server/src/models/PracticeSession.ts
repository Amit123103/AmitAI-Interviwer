import mongoose, { Schema, Document } from 'mongoose'

export interface IPracticeSession extends Document {
    userId: mongoose.Types.ObjectId
    configuration: {
        role: string
        difficulty: 'easy' | 'medium' | 'hard'
        type: string
        focus: string[]
        duration: number
        hints: boolean
    }
    questions: Array<{
        questionText: string
        questionType: string
        difficulty: string
        askedAt: Date
    }>
    answers: Array<{
        questionIndex: number
        transcript: string
        audioUrl?: string
        duration: number
        answeredAt: Date
    }>
    metrics: Array<{
        timestamp: Date
        confidence: number
        fillerWords: {
            count: number
            rate: number
            detected: string[]
        }
        pace: {
            wpm: number
        }
        accuracy: {
            score: number
            keywordCoverage: number
            technicalDepth: number
            structureQuality: number
        }
    }>
    overallScore?: number
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    badges: string[]
    status: 'in_progress' | 'completed' | 'abandoned'
    completedAt?: Date
    createdAt: Date
    updatedAt: Date
}

const PracticeSessionSchema = new Schema<IPracticeSession>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        configuration: {
            role: { type: String, required: true },
            difficulty: {
                type: String,
                enum: ['easy', 'medium', 'hard'],
                required: true
            },
            type: { type: String, required: true },
            focus: [String],
            duration: { type: Number, required: true },
            hints: { type: Boolean, default: false }
        },
        questions: [{
            questionText: String,
            questionType: String,
            difficulty: String,
            askedAt: Date
        }],
        answers: [{
            questionIndex: Number,
            transcript: String,
            audioUrl: String,
            duration: Number,
            answeredAt: Date
        }],
        metrics: [{
            timestamp: Date,
            confidence: Number,
            fillerWords: {
                count: Number,
                rate: Number,
                detected: [String]
            },
            pace: {
                wpm: Number
            },
            accuracy: {
                score: Number,
                keywordCoverage: Number,
                technicalDepth: Number,
                structureQuality: Number
            }
        }],
        overallScore: { type: Number, min: 0, max: 100 },
        strengths: [String],
        weaknesses: [String],
        recommendations: [String],
        badges: [String],
        status: {
            type: String,
            enum: ['in_progress', 'completed', 'abandoned'],
            default: 'in_progress'
        },
        completedAt: Date
    },
    { timestamps: true }
)

// Indexes for performance
PracticeSessionSchema.index({ userId: 1, createdAt: -1 })
PracticeSessionSchema.index({ status: 1 })

export default mongoose.model<IPracticeSession>('PracticeSession', PracticeSessionSchema)
