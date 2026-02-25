import { Request, Response } from 'express';
import Report from '../models/Report';
import axios from 'axios';
import Profile from '../models/Profile';
import fs from 'fs';
import path from 'path';

// AI Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

import { updateUserProgress } from '../services/gamificationService';
import User from '../models/User';
import { sendReportEmail } from '../services/emailService';

export const createReport = async (req: Request, res: Response) => {
    try {
        const { userId, difficulty, sector, persona, finalCode, targetCompany, jobDescription } = req.body;

        // Parse JSON from FormData
        const transcript = JSON.parse(req.body.transcript || '[]');
        const focusLogs = JSON.parse(req.body.focusLogs || '[]');
        const eventLogs = JSON.parse(req.body.eventLogs || '[]');

        const videoFile = req.file;
        const videoUrl = videoFile ? `/uploads/interviews/${videoFile.filename}` : "";

        const studentProfile = await Profile.findOne({ userId });

        // 1. Get Analysis from AI Service
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/interview/generate-report`, {
            transcript,
            focus_logs: focusLogs,
            student_profile: studentProfile,
            sector: sector || 'General',
            persona: persona || 'Friendly Mentor',
            final_code: finalCode,
            target_company: targetCompany || '',
            job_description: jobDescription || ''
        });

        const reportData = aiResponse.data;

        // 1.1 Get Deep Analysis (Granular coaching)
        let deepAnalysis = null;
        try {
            const deepRes = await axios.post(`${AI_SERVICE_URL}/interview/deep-scan`, {
                transcript,
                event_logs: eventLogs,
                student_profile: studentProfile,
                sector: sector || 'General',
                target_company: targetCompany || '',
                job_description: jobDescription || ''
            });
            deepAnalysis = deepRes.data;
        } catch (deepErr) {
            console.error("Deep Scan failed:", deepErr);
        }

        // 2. Save to DB
        const report: any = await Report.create({
            user: userId,
            overallScore: reportData.overall_score || 0,
            ollamaEvaluation: {
                relevance: reportData.metrics?.relevance || 0,
                technicalCorrectness: reportData.metrics?.technical_correctness || 0,
                clarityStructure: reportData.metrics?.clarity_structure || 0,
                confidence: reportData.metrics?.confidence || 0,
                communication: reportData.metrics?.communication || 0,
                conceptCoverage: reportData.metrics?.concept_coverage || 0,
                strengths: reportData.strengths || [],
                improvementAreas: reportData.improvement_areas || [],
                aiSummary: reportData.executive_summary || ""
            },
            confidenceScore: reportData.confidence_score || 0,
            wpm: reportData.wpm || 0,
            fillerWords: reportData.filler_words || {},
            sector: sector || 'General',
            sectorMatchScore: reportData.sector_match_score || 0,
            persona: persona || 'Friendly Mentor',
            targetCompany: targetCompany || '',
            jobDescription: jobDescription || '',
            skillMatrix: reportData.skill_matrix || {},
            transcriptAnalysis: reportData.transcript_analysis || [],
            feedback: reportData.executive_summary || "Good effort!",
            improvement_tips: reportData.improvement_areas || [],
            finalCode: finalCode,
            codeAnalysis: reportData.code_analysis || "",
            videoUrl,
            eventLogs: eventLogs.map((e: any) => ({
                eventType: e.type,
                timestamp: e.timestamp,
                metadata: e.metadata
            })),
            deepAnalysis,
            integrityScore: reportData.integrity_score || 100,
            professionalismScore: reportData.professionalism_score || 10
        });

        // 3. Update Gamification Progress
        const averageScore = Math.round((reportData.technical_score + reportData.communication_score + reportData.focus_score) / 3 * 10); // 0-100 scale
        const xpGained = 100 + averageScore; // Base 100 + Score

        await updateUserProgress(userId, xpGained, {
            interviews: 1,
            newScore: averageScore,
            integrityScore: reportData.integrity_score || 100
        });

        // 4. Send Email Report
        try {
            const user = await User.findById(userId);
            if (user && user.email) {
                await sendReportEmail(user.email, reportData, report.scores);
            }
        } catch (emailErr) {
            console.error("Failed to send email report:", emailErr);
        }

        res.status(201).json(report);
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getReportsByUser = async (req: Request, res: Response) => {
    try {
        const reports = await Report.find({ user: req.params.userId }).sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getReportById = async (req: Request, res: Response) => {
    try {
        const report = await Report.findById(req.params.id);
        if (report) {
            res.json(report);
        } else {
            res.status(404).json({ message: 'Report not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getStats = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const reports = await Report.find({ user: userId }).sort({ createdAt: 1 }); // Sort by date ascending for chart

        if (!reports.length) {
            return res.json({
                totalInterviews: 0,
                averageScore: 0,
                progressData: [],
                recentFeedback: []
            });
        }

        const totalInterviews = reports.length;

        // Calculate Averages
        const totalTechnical = reports.reduce((acc, r) => acc + (r.scores?.technical || 0), 0);
        const totalCommunication = reports.reduce((acc, r) => acc + (r.scores?.communication || 0), 0);
        const totalConfidence = reports.reduce((acc, r) => acc + (r.scores?.confidence || 0), 0);

        const averageScore = Math.round((totalTechnical + totalCommunication + totalConfidence) / (totalInterviews * 3));

        // Format for Recharts
        const progressData = reports.map(r => ({
            date: new Date(r.createdAt).toLocaleDateString(),
            technical: r.scores?.technical || 0,
            communication: r.scores?.communication || 0,
            confidence: r.scores?.confidence || 0
        }));

        // Collect unique improvement tips from last 3 reports
        const recentFeedback = [...new Set(
            reports.slice(-3).flatMap(r => r.improvement_tips || [])
        )].slice(0, 5);

        res.json({
            totalInterviews,
            averageScore,
            progressData,
            recentFeedback
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAllReports = async (req: Request, res: Response) => {
    try {
        const reports = await Report.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        console.error("Error fetching all reports:", error);
        res.status(500).json({ message: 'Server error fetching reports' });
    }
};

export const analyzeResume = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Create FormData to forward the file
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('file', fs.createReadStream(path.join(process.cwd(), req.file.path)));

        const aiResponse = await axios.post(`${AI_SERVICE_URL}/resume/analyze`, formData, {
            headers: {
                ...formData.getHeaders()
            },
            timeout: 90000 // 90s - Resume parsing can be slow on first load
        });

        // Cleanup temp file
        fs.unlinkSync(req.file.path);

        res.json(aiResponse.data);
    } catch (error) {
        console.error("Error analyzing resume:", error);
        res.status(500).json({ message: 'Server error analyzing resume' });
    }
};

export const analyzeFrame = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No frame uploaded' });
        }

        // Create FormData to forward the file
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('file', fs.createReadStream(path.join(process.cwd(), req.file.path)));

        const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze-frame`, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        // Cleanup temp file
        fs.unlinkSync(req.file.path);

        res.json(aiResponse.data);
    } catch (error) {
        console.error("Error analyzing frame:", error);
        res.status(500).json({ message: 'Server error analyzing frame' });
    }
};
