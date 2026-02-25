
import { Request, Response } from 'express';
import InterviewSession from '../models/InterviewSession';
import Problem from '../models/Problem';
import axios from 'axios';
import mongoose from 'mongoose';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Initialize a new Coding Interview Session
export const initiateInterview = async (req: Request, res: Response) => {
    try {
        const { userId, resumeText, difficulty } = req.body;

        // 1. Analyze Resume for Skills (Reuse existing logic or rely on generate-questions)
        // We can pass resumeText directly to generate-questions.

        let skills = {
            languages: ['JavaScript', 'Python'],
            frameworks: [],
            difficulty: difficulty || 'Medium',
            suggestedRole: 'Fullstack Developer'
        };

        // 2. Generate Questions via AI Service
        let problems: any[] = [];
        try {
            console.log("Requesting Questions from AI Service...");
            const aiRes = await axios.post(`${AI_SERVICE_URL}/resume/generate-questions`, {
                resume_text: resumeText || "",
                count: 3, // Default to 3 questions for a round
                difficulty: difficulty || 'Medium',
                topic: 'General'
            });

            const generatedQuestions = aiRes.data.questions;

            if (generatedQuestions && Array.isArray(generatedQuestions)) {
                // Bulk save generated questions
                const problemDocs = generatedQuestions.map((q: any) => ({
                    ...q,
                    isGenerated: true,
                    // Slug needs to be unique. 
                    slug: q.slug + '-' + new mongoose.Types.ObjectId().toString(),
                    stats: { accepted: 0, submissions: 0, acceptanceRate: 0 }
                }));

                const savedProblems = await Problem.insertMany(problemDocs);
                problems = savedProblems.map(p => ({
                    problemId: p._id,
                    status: 'Pending',
                    score: 0
                }));
            }
        } catch (err) {
            console.error("AI Question Generation Failed:", err);
            // Fallback: Pick random existing problems
            const targetDifficulty = difficulty || 'Medium';
            const existingProblems = await Problem.find({ difficulty: targetDifficulty }).limit(3);
            problems = existingProblems.map(p => ({
                problemId: p._id,
                status: 'Pending',
                score: 0
            }));
        }

        if (problems.length === 0) {
            return res.status(500).json({ error: "Failed to generate or find problems." });
        }

        // 3. Create Session
        const session = new InterviewSession({
            userId,
            problems: problems,
            currentProblemIndex: 0,
            status: 'Setup',
            resumeText,
            extractedSkills: skills,
            startTime: new Date(),
            durationMinutes: 60 // 3 questions -> 60 mins
        });

        await session.save();

        res.json({
            sessionId: session._id,
            problemCount: problems.length,
            firstProblemId: problems[0].problemId,
            skills
        });

    } catch (error: any) {
        console.error("Initiate Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Start the Interview (Status -> Live)
export const startInterview = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.body;
        const session = await InterviewSession.findById(sessionId)
            .populate('problems.problemId'); // Populate the problems array

        if (!session) return res.status(404).json({ error: "Session not found" });
        if (session.status !== 'Setup') return res.status(400).json({ error: "Interview already started or completed" });

        session.status = 'Live';
        session.startTime = new Date();
        // Set end time based on duration
        const endTime = new Date(session.startTime.getTime() + session.durationMinutes * 60000);
        session.endTime = endTime;

        await session.save();

        // Return the first problem
        const currentProblemIndex = session.currentProblemIndex || 0;
        const currentProblem = session.problems[currentProblemIndex].problemId;

        res.json({
            session,
            problem: currentProblem
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Submit Interview (Status -> Completed)
export const submitInterview = async (req: Request, res: Response) => {
    try {
        const { sessionId, code, language } = req.body;
        const session = await InterviewSession.findById(sessionId);

        if (!session) return res.status(404).json({ error: "Session not found" });

        // 1. Evaluate Code (Mock or basic check for now)
        // In real world, we'd run test cases here via ExecutionService.

        let qualityScore = 0;
        let correctnessScore = Math.floor(Math.random() * 40) + 60; // Mock correctness

        // 2. Generate AI Feedback Report
        let feedback = "Good effort. Consider optimizing for time complexity.";
        try {
            // Call AI Service for Code Analysis & Feedback
            const aiRes = await axios.post(`${AI_SERVICE_URL}/coding/analyze`, {
                problem_title: "Interview Problem",
                user_code: code,
                language: language
            });
            if (aiRes.data) {
                qualityScore = aiRes.data.qualityScore || 85;
                feedback = aiRes.data.feedback || feedback;
            }
        } catch (err) {
            console.error("AI Analysis Failed", err);
        }

        session.status = 'Completed';
        session.codeSnapshot = code;
        session.score = {
            correctness: correctnessScore,
            quality: qualityScore,
            efficiency: 80, // Placeholder
            total: (correctnessScore + qualityScore + 80) / 3
        };
        session.feedback = feedback;
        session.endTime = new Date(); // Actual end time

        await session.save();

        res.json({
            message: "Interview Submitted",
            score: session.score,
            feedback: session.feedback
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Get Session Status/Details
export const getSession = async (req: Request, res: Response) => {
    try {
        const session = await InterviewSession.findById(req.params.id)
            .populate('problems.problemId'); // Populate
        if (!session) return res.status(404).json({ error: "Session not found" });
        res.json(session);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
