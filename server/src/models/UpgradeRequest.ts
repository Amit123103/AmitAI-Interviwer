import mongoose, { Schema, Document } from 'mongoose';

export interface IUpgradeRequest extends Document {
    userId: mongoose.Types.ObjectId;
    requestedPlan: 'monthly' | '6month' | 'yearly';
    status: 'pending' | 'approved' | 'rejected';
    adminNote?: string;
    studentNote?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UpgradeRequestSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    requestedPlan: { type: String, enum: ['monthly', '6month', 'yearly'], default: 'monthly' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote: { type: String },
    studentNote: { type: String }
}, { timestamps: true });

export default mongoose.model<IUpgradeRequest>('UpgradeRequest', UpgradeRequestSchema);
