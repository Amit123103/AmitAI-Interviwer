import mongoose, { Schema, Document } from 'mongoose';

export interface ILoginLog extends Document {
    userId: mongoose.Types.ObjectId;
    email: string;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
}

const LoginLogSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        email: { type: String, required: true, index: true },
        ipAddress: { type: String, required: true },
        userAgent: { type: String, required: true },
        timestamp: { type: Date, default: Date.now, index: true },
    },
    { timestamps: false }
);

export default mongoose.model<ILoginLog>('LoginLog', LoginLogSchema);
