import mongoose, { Schema, Document } from 'mongoose';

export interface IExperience {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
}

export interface IEducation {
    id: string;
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
}

export interface IProject {
    id: string;
    title: string;
    description: string;
    link: string;
    technologies: string[];
    imageUrl?: string;
}

export interface IPortfolio extends Document {
    userId: mongoose.Types.ObjectId;
    templateId: string;
    isPublished: boolean;
    personalDetails: {
        fullName: string;
        headline: string;
        about: string;
        email: string;
        phone: string;
        location: string;
        linkedin: string;
        github: string;
        website: string;
        profileImage?: string;
    };
    experience: IExperience[];
    education: IEducation[];
    projects: IProject[];
    skills: string[];
    customSlug?: string;
    customTheme?: {
        primaryColor?: string;
        fontFamily?: string;
    };
}

const PortfolioSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        templateId: { type: String, default: 'modern' },
        isPublished: { type: Boolean, default: false },
        customSlug: { type: String, unique: true, sparse: true },
        personalDetails: {
            fullName: { type: String, default: '' },
            headline: { type: String, default: '' },
            about: { type: String, default: '' },
            email: { type: String, default: '' },
            phone: { type: String, default: '' },
            location: { type: String, default: '' },
            linkedin: { type: String, default: '' },
            github: { type: String, default: '' },
            website: { type: String, default: '' },
            profileImage: { type: String, default: '' },
        },
        experience: [{
            id: { type: String },
            title: { type: String },
            company: { type: String },
            location: { type: String },
            startDate: { type: String },
            endDate: { type: String },
            description: { type: String }
        }],
        education: [{
            id: { type: String },
            degree: { type: String },
            institution: { type: String },
            location: { type: String },
            startDate: { type: String },
            endDate: { type: String },
            description: { type: String }
        }],
        projects: [{
            id: { type: String },
            title: { type: String },
            description: { type: String },
            link: { type: String },
            technologies: { type: [String] },
            imageUrl: { type: String }
        }],
        skills: { type: [String], default: [] },
        customTheme: {
            primaryColor: { type: String },
            fontFamily: { type: String },
        }
    },
    { timestamps: true }
);

export default mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);
