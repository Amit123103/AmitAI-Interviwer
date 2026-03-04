import { Request, Response } from 'express';
import User from '../models/User';
import { updateUserProgress } from '../services/gamificationService';

export const updateProgress = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id;
        const { coinsGained, statsUpdate } = req.body;

        const result = await updateUserProgress(userId!, coinsGained, statsUpdate);

        res.json(result);

    } catch (error) {
        res.status(500).json({ message: 'Error updating gamification', error });
    }
};

export const getLeaderboard = async (req: any, res: Response) => {
    try {
        const { period } = req.query;
        let sortField = 'amitaiCoins';
        let selectField = 'username amitaiCoins level achievements weeklyCoins';

        if (period === 'weekly') {
            sortField = 'weeklyCoins';
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
        const result = await updateUserProgress(userId!, 100, { type: 'daily_claim' }); // 100 Coins for checking in
        res.json({ message: 'AmitAI Coins claimed!', ...result });
    } catch (error) {
        res.status(500).json({ message: 'Error claiming reward', error });
    }
};
