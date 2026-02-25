import mongoose, { Schema, Document } from 'mongoose';

export interface IProfile extends Document {
    userId: mongoose.Types.ObjectId;
    fullName: string;
    course: string;
    department: string;
    dreamCompany: string;
    resumePath?: string;
    resumeText?: string;
    skills: string[];
    projects: string[];
    internships: string[];
    tools: string[];
    certifications: string[];
    achievements: string[];
    bio?: string;
    profilePhoto?: string;
}

const ProfileSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        fullName: { type: String, required: true },
        course: { type: String, required: true },
        department: { type: String, required: true },
        dreamCompany: { type: String, required: true },
        bio: { type: String },
        profilePhoto: { type: String },
        resumePath: { type: String },
        resumeText: { type: String },
        skills: { type: [String], default: [] },
        projects: { type: [String], default: [] },
        internships: { type: [String], default: [] },
        tools: { type: [String], default: [] },
        certifications: { type: [String], default: [] },
        achievements: { type: [String], default: [] },
    },
    { timestamps: true }
);

export default mongoose.model<IProfile>('Profile', ProfileSchema);
