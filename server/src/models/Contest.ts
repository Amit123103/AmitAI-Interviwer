
import mongoose, { Document, Schema } from 'mongoose';

export interface IContest extends Document {
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    status: 'Upcoming' | 'Live' | 'Ended';

    problems: mongoose.Types.ObjectId[]; // References to Problem model
    participants: mongoose.Types.ObjectId[]; // References to User model

    leaderboard: {
        userId: mongoose.Types.ObjectId;
        username: string;
        score: number;
        finishTime: number; // Time taken in seconds/minutes
    }[];

    prizes: string[]; // e.g., ["1000 XP", "Gold Badge"]

    createdAt: Date;
    updatedAt: Date;
}

const ContestSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    status: {
        type: String,
        enum: ['Upcoming', 'Live', 'Ended'],
        default: 'Upcoming',
        index: true
    },

    problems: [{ type: Schema.Types.ObjectId, ref: 'Problem' }],
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    leaderboard: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        username: String,
        score: Number,
        finishTime: Number
    }],

    prizes: [String]
}, { timestamps: true });

// Auto-update status based on time (Simplified middleware)
// In a real app, use a cron job. Here, we check on fetch.

export default mongoose.model<IContest>('Contest', ContestSchema);
