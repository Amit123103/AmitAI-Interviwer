import mongoose, { Schema, Document } from 'mongoose';

export interface IComment {
    userId: mongoose.Types.ObjectId;
    username: string;
    content: string;
    createdAt: Date;
}

export interface IPost extends Document {
    userId: mongoose.Types.ObjectId;
    username: string; // denormalized for easier display
    title: string;
    content: string;
    category: 'General' | 'System Design' | 'Algorithms' | 'Success Stories' | 'Career Advice';
    tags: string[];
    upvotes: mongoose.Types.ObjectId[]; // Array of user IDs who upvoted
    downvotes: mongoose.Types.ObjectId[];
    views: number;
    comments: IComment[];
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const PostSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
        type: String,
        enum: ['General', 'System Design', 'Algorithms', 'Success Stories', 'Career Advice'],
        default: 'General'
    },
    tags: [{ type: String }],
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    comments: [CommentSchema]
}, { timestamps: true });

export default mongoose.model<IPost>('Post', PostSchema);
