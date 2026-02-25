import { Request, Response } from 'express';
import Profile from '../models/Profile';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const parseResumeWithAI = async (resumePath: string) => {
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(resumePath));
        const aiRes = await axios.post(`${AI_SERVICE_URL}/resume/parse`, formData, {
            headers: formData.getHeaders(),
            timeout: 15000 // 15 seconds timeout
        });

        if (aiRes.data && aiRes.data.parsed) {
            return {
                parsed: aiRes.data.parsed,
                text: aiRes.data.raw_text || ""
            };
        }
    } catch (err: any) {
        console.error("AI Resume Parsing Error:", err.message);
    }
    return null;
};

export const createOrUpdateProfile = async (req: any, res: Response) => {
    const { fullName, course, department, dreamCompany } = req.body;
    const resumePath = req.file ? req.file.path : undefined;

    if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        let profile = await Profile.findOne({ userId: req.user._id });

        // Prepare data to update/create
        const profileFields: any = {};
        if (fullName) profileFields.fullName = fullName;
        if (course) profileFields.course = course;
        if (department) profileFields.department = department;
        if (dreamCompany) profileFields.dreamCompany = dreamCompany;
        if (resumePath) profileFields.resumePath = resumePath;

        // If a new resume is uploaded, parse it
        if (resumePath) {
            const aiData = await parseResumeWithAI(resumePath);
            if (aiData) {
                profileFields.resumeText = aiData.text;
                // Merge parsed data
                const { skills, projects, internships, tools, certifications, achievements } = aiData.parsed;
                if (skills) profileFields.skills = skills;
                if (projects) profileFields.projects = projects;
                if (internships) profileFields.internships = internships;
                if (tools) profileFields.tools = tools;
                if (certifications) profileFields.certifications = certifications;
                if (achievements) profileFields.achievements = achievements;
            }
        }

        if (profile) {
            // Update
            profile = await Profile.findOneAndUpdate(
                { userId: req.user._id },
                { $set: profileFields },
                { returnDocument: 'after' }
            );
            return res.json(profile);
        } else {
            // Create
            profileFields.userId = req.user._id;
            profile = new Profile(profileFields);
            await profile.save();
            res.status(201).json(profile);
        }

    } catch (error: any) {
        console.error("Profile Controller Error:", error.message);
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

export const getProfile = async (req: any, res: Response) => {
    try {
        const profile = await Profile.findOne({ userId: req.user._id }).populate('userId', 'subscriptionStatus email username');
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
