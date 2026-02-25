
import express from 'express';
import Contest from '../models/Contest';
import User from '../models/User';
import Submission from '../models/Submission';

const router = express.Router();

// GET /api/contests
// Fetch list of contests (Upcoming/Live/Past)
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const query: any = {};
        if (status) query.status = status;

        const contests = await Contest.find(query)
            .sort({ startTime: 1 }) // Closest first
            .select('-leaderboard'); // Exclude heavy leaderboard data for list view

        res.json(contests);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/contests/:id
// Fetch single contest details (and problems if Live/Ended)
router.get('/:id', async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id)
            .populate('problems', 'title slug difficulty category'); // Only show basic info

        if (!contest) return res.status(404).json({ error: "Contest not found" });

        // Security: Don't show problems if contest is Upcoming
        const now = new Date();
        if (contest.startTime > now) {
            contest.problems = [];
        }

        res.json(contest);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/contests/:id/register
// Register a user for a contest
router.post('/:id/register', async (req, res) => {
    try {
        const { userId } = req.body;
        const contest = await Contest.findById(req.params.id);

        if (!contest) return res.status(404).json({ error: "Contest not found" });
        if (contest.participants.includes(userId)) {
            return res.status(400).json({ error: "Already registered" });
        }

        contest.participants.push(userId);
        await contest.save();

        res.json({ message: "Registered successfully", participants: contest.participants.length });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/contests/:id/leaderboard
// Fetch scheduling/realtime leaderboard
router.get('/:id/leaderboard', async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id).select('leaderboard');
        if (!contest) return res.status(404).json({ error: "Contest not found" });

        // Sort leaderboard by Score (Desc), then Time (Asc)
        const sortedBoard = contest.leaderboard.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.finishTime - b.finishTime;
        });

        res.json(sortedBoard);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
