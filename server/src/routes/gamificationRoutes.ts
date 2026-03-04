
import express from 'express';
import User from '../models/User';
import mongoose from 'mongoose';

const router = express.Router();

// Helper to check if date is today
const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
};

// 1. Sync / Get Gamification State
router.post('/sync', async (req, res) => {
    try {
        const { userId, action, value } = req.body;
        console.log('Gamification Sync Request:', { userId, action, value });

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Valid userId is required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            console.warn(`Gamification Sync: User not found for ID ${userId}`);
            return res.status(404).json({ message: "User not found" });
        }

        // A. Handle Coin Update
        if (action === 'ADD_COINS' && typeof value === 'number' && value > 0) {
            user.amitaiCoins = (user.amitaiCoins || 0) + value;
            user.weeklyCoins = (user.weeklyCoins || 0) + value;

            // Level Up Logic (Coins threshold)
            const requiredCoins = user.level * 1000 * 2;
            if (user.amitaiCoins >= requiredCoins) {
                user.level += 1;
            }
        }

        // B. Handle Session Activity (Replacing legacy streak logic)
        if (action === 'PRACTICE_COMPLETE') {
            const today = new Date();
            user.lastPracticeDate = today;
            // No more streak increments, but we could add bonus coins here
            user.amitaiCoins += 50;
            user.weeklyCoins += 50;
        }

        // C. Daily Missions Check
        if (!user.dailyMissions) user.dailyMissions = [];
        const todayStr = new Date().toDateString();
        const hasTodayMissions = user.dailyMissions.some(m => new Date(m.date).toDateString() === todayStr);

        if (!hasTodayMissions) {
            user.dailyMissions = [
                { id: 'm1', type: 'practice', target: 1, progress: 0, completed: false, date: new Date() },
                { id: 'm2', type: 'questions', target: 5, progress: 0, completed: false, date: new Date() },
                { id: 'm3', type: 'code', target: 100, progress: 0, completed: false, date: new Date() }
            ];
        }

        // Update Mission Progress
        if (action === 'UPDATE_MISSION') {
            const { missionType, progressDelta } = req.body;
            user.dailyMissions.forEach(m => {
                if (m.type === missionType && !m.completed && isToday(new Date(m.date))) {
                    m.progress += progressDelta;
                    if (m.progress >= m.target) {
                        m.completed = true;
                        user.amitaiCoins += 50; // Bonus for completion
                        user.weeklyCoins += 50;
                    }
                }
            });
        }

        try {
            await user.save();
        } catch (saveErr: any) {
            if (saveErr.name === 'VersionError') {
                const latestUser = await User.findById(userId);
                if (latestUser) {
                    return res.json({
                        amitaiCoins: latestUser.amitaiCoins || 0,
                        level: latestUser.level || 1,
                        dailyMissions: latestUser.dailyMissions || [],
                        achievements: latestUser.achievements || []
                    });
                }
            }
            throw saveErr;
        }

        res.json({
            amitaiCoins: user.amitaiCoins || 0,
            level: user.level || 1,
            dailyMissions: user.dailyMissions || [],
            achievements: user.achievements || []
        });

    } catch (err: any) {
        console.error('Gamification Sync Error:', err.message);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// 2. Get Leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const topUsers = await User.find({})
            .sort({ amitaiCoins: -1 })
            .limit(10)
            .select('username amitaiCoins level avatar achievements');

        res.json(topUsers);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
