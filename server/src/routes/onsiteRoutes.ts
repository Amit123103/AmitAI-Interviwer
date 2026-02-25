import express from 'express';
import OnsiteLoop from '../models/OnsiteLoop';
import Report from '../models/Report';
import axios from 'axios';

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Create a new Onsite Loop
router.post('/', async (req, res) => {
    try {
        const { userId, company, role, rounds } = req.body;

        // Validate rounds if necessary, or trust client for now (MVP)
        const newLoop = new OnsiteLoop({
            user: userId,
            company,
            role,
            rounds: rounds || [ // Fallback if no rounds provided
                { roundName: 'Behavioral Round (HR)', type: 'behavioral', status: 'Pending' },
                { roundName: 'Technical Round (Coding)', type: 'coding', status: 'Pending' },
                { roundName: 'System Design / Architecture', type: 'system-design', status: 'Pending' }
            ]
        });
        await newLoop.save();
        res.status(201).json(newLoop);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get all loops for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const loops = await OnsiteLoop.find({ user: req.params.userId }).sort({ createdAt: -1 });
        res.json(loops);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get single loop detail
router.get('/:id', async (req, res) => {
    try {
        const loop = await OnsiteLoop.findById(req.params.id).populate('rounds.reportId');
        res.json(loop);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Complete a specific round and save results
router.post('/:id/round/:roundId/complete', async (req, res) => {
    try {
        const { scores, feedback, transcript } = req.body;
        const loop = await OnsiteLoop.findById(req.params.id);

        if (!loop) return res.status(404).json({ message: 'Loop not found' });

        const round = loop.rounds.id(req.params.roundId);
        if (!round) return res.status(404).json({ message: 'Round not found' });

        // Update Round Data
        round.status = 'Completed';
        // In a real app, we'd save the transcript to a Report model and link it
        // For this MVP, we might store scores directly on the round or create a lightweight Report

        // Create a Report for this round to be used in final aggregation
        const newReport = new Report({
            user: loop.user,
            interviewType: 'Mixed',
            scores: {
                technical: scores.technical,
                communication: scores.communication,
                confidence: scores.cultural || scores.confidence || 5
            },
            feedback: feedback.summary,
            improvement_tips: feedback.cons || [],
            ollamaEvaluation: {
                technicalKnowledge: scores.technical * 10,
                problemSolving: scores.technical * 10,
                communicationClarity: scores.communication * 10,
                confidenceLevel: (scores.cultural || 5) * 10,
                responseCompleteness: 80,
                professionalism: 90,
                strengths: feedback.pros || [],
                improvementAreas: feedback.cons || [],
                aiSummary: feedback.summary || ''
            },
            transcriptAnalysis: (transcript || []).map((t: any) => ({
                role: t.role,
                text: t.text,
                confidenceScore: 80,
                sentiment: 'Neutral',
                feedback: ''
            })),
            targetCompany: loop.company,
            sector: round.type,
            overallScore: Math.round(((scores.technical + scores.communication + (scores.cultural || 5)) / 3) * 10)
        });
        await newReport.save();

        round.reportId = newReport._id;
        await loop.save();

        res.json({ message: 'Round completed', round, report: newReport });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Finalize Hiring Decision
router.post('/:id/finalize', async (req, res) => {
    try {
        const loop = await OnsiteLoop.findById(req.params.id).populate('rounds.reportId');
        if (!loop) return res.status(404).json({ message: 'Loop not found' });

        const completedReports = loop.rounds
            .filter(r => r.status === 'Completed' && r.reportId)
            .map(r => r.reportId);

        if (completedReports.length === 0) {
            return res.status(400).json({ message: 'No completed rounds to finalize' });
        }

        // Call AI Service for consolidated decision
        const decisionRes = await axios.post(`${AI_SERVICE_URL}/generate-onsite-decision`, {
            reports: completedReports,
            company: loop.company,
            role: loop.role
        });

        loop.finalDecision = {
            recommendation: decisionRes.data.recommendation,
            justification: decisionRes.data.justification,
            committeeFeedback: decisionRes.data.committeeFeedback || []
        };
        loop.status = 'Completed';
        await loop.save();

        res.json(loop);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
