import mongoose, { Schema, Document } from 'mongoose';

export interface IProPayment extends Document {
    userId: mongoose.Types.ObjectId;
    email: string;
    selectedPlan: 'monthly' | '6month' | 'yearly';
    amount: number;
    transactionId: string;
    screenshotPath: string;
    paymentDate: Date;
    status: 'pending' | 'approved' | 'rejected';
    adminNote?: string;
    reviewedAt?: Date;
    reviewedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ProPaymentSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        email: { type: String, required: true },
        selectedPlan: {
            type: String,
            enum: ['monthly', '6month', 'yearly'],
            required: true,
        },
        amount: { type: Number, required: true },
        transactionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        screenshotPath: { type: String, required: true },
        paymentDate: { type: Date, required: true },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
            index: true,
        },
        adminNote: { type: String },
        reviewedAt: { type: Date },
        reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

export default mongoose.model<IProPayment>('ProPayment', ProPaymentSchema);
