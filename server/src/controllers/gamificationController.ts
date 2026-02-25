
import { Request, Response } from 'express';
import User from '../models/User';

const XP_PER_LEVEL_BASE = 1000;

import { updateUserProgress } from '../services/gamificationService';

export const updateProgress = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id;
        const { xpGained, statsUpdate } = req.body;

        const result = await updateUserProgress(userId!, xpGained, statsUpdate);

        res.json(result);

    } catch (error) {
        res.status(500).json({ message: 'Error updating gamification', error });
    }
};

export const getLeaderboard = async (req: any, res: Response) => {
    try {
        const { period } = req.query;
        let sortField = 'xp';
        let selectField = 'username xp level achievements weeklyXp';

        if (period === 'weekly') {
            sortField = 'weeklyXp';
        }

        const topUsers = await User.find({})
            .sort({ [sortField]: -1 })
            .limit(10)
            .select(selectField);

        res.json(topUsers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaderboard', error });
    }
};

export const claimDailyReward = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id;
        const result = await updateUserProgress(userId!, 50, { type: 'daily_claim' }); // 50 XP for checking in
        res.json({ message: 'Daily reward claimed!', ...result });
    } catch (error) {
        res.status(500).json({ message: 'Error claiming reward', error });
    }
};
