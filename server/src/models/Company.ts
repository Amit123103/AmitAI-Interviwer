import mongoose, { Schema, Document } from 'mongoose'

export interface ICompany extends Document {
    name: string
    slug: string
    category: 'FAANG' | 'Indian IT' | 'Consulting' | 'Startups' | 'Product'
    logo: string
    difficulty: 'easy' | 'medium' | 'hard'
    overview: string
    culture?: string
    salaryRange?: string
    timeline?: string
    successRate?: number
    hiringProcess: Array<{
        title: string
        duration: string
        format: string
        topics: string[]
        difficulty: string
        description: string
    }>
    commonQuestions: string[]
    evaluationCriteria: string[]
    tips: string[]
    commonMistakes: string[]
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

const CompanySchema = new Schema<ICompany>(
    {
        name: { type: String, required: true, unique: true, index: true },
        slug: { type: String, required: true, unique: true, index: true },
        category: {
            type: String,
            enum: ['FAANG', 'Indian IT', 'Consulting', 'Startups', 'Product'],
            required: true,
            index: true
        },
        logo: String,
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            required: true
        },
        overview: { type: String, required: true },
        culture: String,
        salaryRange: String,
        timeline: String,
        successRate: { type: Number, min: 0, max: 100 },
        hiringProcess: [{
            title: String,
            duration: String,
            format: String,
            topics: [String],
            difficulty: String,
            description: String
        }],
        commonQuestions: [String],
        evaluationCriteria: [String],
        tips: [String],
        commonMistakes: [String],
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
)

// Text search for company search
CompanySchema.index({ name: 'text', overview: 'text' })

// Index for category filtering
CompanySchema.index({ category: 1, isActive: 1 })

export default mongoose.model<ICompany>('Company', CompanySchema)
