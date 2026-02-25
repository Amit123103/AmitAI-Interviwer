import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    role: 'student' | 'admin' | 'sub-admin';
    xp: number;
    weeklyXp: number;
    currentWeek: string;
    level: number;
    streak: number;
    lastPracticeDate: Date | null;
    achievements: Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
        unlockedAt: Date;
    }>;
    stats: {
        totalInterviews: number;
        totalCodeLines: number;
        averageScore: number;
    };
    maxStreak: number;
    subscriptionStatus: 'free' | 'pro';
    stripeCustomerId?: string;
    subscriptionId?: string;
    currentPeriodEnd?: Date;
    preferences: {
        defaultVoice: 'Female (Alloy)',
        defaultDifficulty: 'Intermediate',
        defaultQuestionCount: 10,
        language: 'English',
        notifications: {
            email: true,
            reminders: true,
            updates: true
        },
        theme: 'dark',
        accentColor: '#10b981', // emerald-500
        fontSize: 'medium'
    },
    dailyMissions: Array<{
        id: string;
        type: string; // 'practice', 'interview', 'code', 'streak'
        target: number;
        progress: number;
        completed: boolean;
        date: Date; // To track which day this mission belongs to
    }>;
    weeklyGoal: {
        targetXp: number;
        currentXp: number;
        startDate: Date;
        endDate: Date;
    };
    proSubscription: {
        isActive: boolean;
        plan: 'monthly' | '6month' | 'yearly' | null;
        startDate: Date | null;
        expiryDate: Date | null;
        paymentId: mongoose.Types.ObjectId | null;
    };
    accountStatus: 'active' | 'suspended';
    twoFactorEnabled: boolean;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: ['student', 'admin', 'sub-admin'], default: 'student' },
        xp: { type: Number, default: 0 },
        weeklyXp: { type: Number, default: 0 },
        currentWeek: { type: String, default: '' },
        level: { type: Number, default: 1 },
        streak: { type: Number, default: 0 },
        lastPracticeDate: { type: Date, default: null },
        dailyMissions: [{
            _id: false,
            id: { type: String, required: true },
            type: { type: String, required: true },
            target: { type: Number, required: true },
            progress: { type: Number, default: 0 },
            completed: { type: Boolean, default: false },
            date: { type: Date, default: Date.now }
        }],
        weeklyGoal: {
            targetXp: { type: Number, default: 1000 },
            currentXp: { type: Number, default: 0 },
            startDate: Date,
            endDate: Date
        },
        achievements: [{
            _id: false,
            id: { type: String, required: true },
            name: { type: String, required: true },
            description: { type: String, required: true },
            icon: { type: String, required: true },
            unlockedAt: { type: Date, default: Date.now }
        }],
        stats: {
            totalInterviews: { type: Number, default: 0 },
            totalCodeLines: { type: Number, default: 0 },
            averageScore: { type: Number, default: 0 }
        },
        maxStreak: { type: Number, default: 0 },
        subscriptionStatus: { type: String, enum: ['free', 'pro'], default: 'free' },
        stripeCustomerId: { type: String },
        subscriptionId: { type: String },
        currentPeriodEnd: { type: Date },
        proSubscription: {
            isActive: { type: Boolean, default: false },
            plan: { type: String, enum: ['monthly', '6month', 'yearly', null], default: null },
            startDate: { type: Date, default: null },
            expiryDate: { type: Date, default: null },
            paymentId: { type: Schema.Types.ObjectId, ref: 'ProPayment', default: null },
        },
        accountStatus: { type: String, enum: ['active', 'suspended'], default: 'active' },
        preferences: {
            defaultVoice: { type: String, default: 'Female (Alloy)' },
            defaultDifficulty: { type: String, enum: ['Easy', 'Intermediate', 'Advanced'], default: 'Intermediate' },
            defaultQuestionCount: { type: Number, default: 10 },
            language: { type: String, default: 'English' },
            notifications: {
                email: { type: Boolean, default: true },
                reminders: { type: Boolean, default: true },
                updates: { type: Boolean, default: true }
            },
            theme: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' },
            accentColor: { type: String, default: '#10b981' },
            fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' }
        },
        twoFactorEnabled: { type: Boolean, default: false },
        resetPasswordToken: { type: String },
        resetPasswordExpires: { type: Date }
    },
    { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
