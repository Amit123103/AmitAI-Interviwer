import mongoose, { Schema, Document } from 'mongoose'

export interface ICustomQuestionList extends Document {
    userId: mongoose.Types.ObjectId
    name: string
    description?: string
    questions: mongoose.Types.ObjectId[]
    isPublic: boolean
    createdAt: Date
    updatedAt: Date
}

const CustomQuestionListSchema = new Schema<ICustomQuestionList>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        name: { type: String, required: true },
        description: String,
        questions: [{
            type: Schema.Types.ObjectId,
            ref: 'Question'
        }],
        isPublic: { type: Boolean, default: false }
    },
    { timestamps: true }
)

// Index for user's lists
CustomQuestionListSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.model<ICustomQuestionList>('CustomQuestionList', CustomQuestionListSchema)
