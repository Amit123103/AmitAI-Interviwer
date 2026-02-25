
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

        // A. Handle XP Update
        if (action === 'ADD_XP' && typeof value === 'number' && value > 0) {
            user.xp = (user.xp || 0) + value;
            user.weeklyXp = (user.weeklyXp || 0) + value;

            // Level Up Logic (Simple formula: Level * 1000 * 1.5)
            const requiredXp = user.level * 1000 * 1.5;
            if (user.xp >= requiredXp) {
                user.level += 1;
                user.xp -= requiredXp; // Carry over or reset? Usually continuous. 
                // Let's keep XP cumulative but check total. 
                // Actually, let's just increment level if threshold met based on total XP
                // Simplified:
                // nextLevelXp = (Level^2) * 100.

                // Let's stick to the current implementation where 'xp' is total accumulated.
                // We'll calculate level on the fly or update it here.
                // For now, simple update:
            }
        }

        // B. Handle Streak
        if (action === 'PRACTICE_COMPLETE') {
            const today = new Date();
            if (user.lastPracticeDate) {
                const last = new Date(user.lastPracticeDate);
                const diffTime = Math.abs(today.getTime() - last.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    user.streak += 1;
                } else if (diffDays > 1) {
                    user.streak = 1; // Reset
                }
                // If diffDays == 0 (same day), do nothing
            } else {
                user.streak = 1;
            }
            user.lastPracticeDate = today;
            user.maxStreak = Math.max(user.maxStreak, user.streak);
        }

        // C. Daily Missions Check
        // If no missions for today, generate them
        if (!user.dailyMissions) user.dailyMissions = [];
        const todayStr = new Date().toDateString();
        const hasTodayMissions = user.dailyMissions.some(m => new Date(m.date).toDateString() === todayStr);

        if (!hasTodayMissions) {
            user.dailyMissions = [
                { id: 'm1', type: 'practice', target: 1, progress: 0, completed: false, date: new Date() },
                { id: 'm2', type: 'questions', target: 5, progress: 0, completed: false, date: new Date() },
                { id: 'm3', type: 'streak', target: 1, progress: user.streak > 0 ? 1 : 0, completed: user.streak > 0, date: new Date() }
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
                        user.xp += 50; // Bonus for completion
                    }
                }
            });
        }

        try {
            await user.save();
        } catch (saveErr: any) {
            if (saveErr.name === 'VersionError') {
                console.warn(`Gamification Sync Version Conflict: User ${userId} modified by parallel request. Returning latest state.`);
                const latestUser = await User.findById(userId);
                if (latestUser) {
                    return res.json({
                        xp: latestUser.xp || 0,
                        level: latestUser.level || 1,
                        streak: latestUser.streak || 0,
                        dailyMissions: latestUser.dailyMissions || [],
                        achievements: latestUser.achievements || []
                    });
                }
            }
            throw saveErr; // Rethrow other errors
        }

        res.json({
            xp: user.xp || 0,
            level: user.level || 1,
            streak: user.streak || 0,
            dailyMissions: user.dailyMissions || [],
            achievements: user.achievements || []
        });

    } catch (err: any) {
        console.error('Gamification Sync Error:', err.message);
        console.error('Error Stack:', err.stack);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// 2. Get Leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const topUsers = await User.find({})
            .sort({ xp: -1 })
            .limit(10)
            .select('username xp level streak avatar'); // Add avatar if it exists

        res.json(topUsers);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
