import mongoose, { Schema, Document } from 'mongoose';

export interface IResource extends Document {
    title: string;
    description?: string;
    url: string;
    type: 'PDF' | 'Video' | 'Link' | 'Doc';
    category: string;
    isProOnly: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ResourceSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    url: { type: String, required: true },
    type: { type: String, enum: ['PDF', 'Video', 'Link', 'Doc'], required: true },
    category: { type: String, required: true },
    isProOnly: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<IResource>('Resource', ResourceSchema);
