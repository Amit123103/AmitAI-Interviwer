import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminLog extends Document {
    adminId: mongoose.Types.ObjectId;
    adminName: string;
    action: string;
    targetId?: mongoose.Types.ObjectId | string;
    targetName?: string;
    details: any;
    ipAddress: string;
    createdAt: Date;
}

const AdminLogSchema: Schema = new Schema({
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    adminName: { type: String, required: true },
    action: { type: String, required: true },
    targetId: { type: Schema.Types.Mixed },
    targetName: { type: String },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String }
}, { timestamps: true });

// Index for fast dashboard retrieval
AdminLogSchema.index({ createdAt: -1 });

export default mongoose.model<IAdminLog>('AdminLog', AdminLogSchema);
