import User from '../models/User';
import { checkBadges } from './badgeService';

const COINS_PER_LEVEL_BASE = 500;

export const updateUserProgress = async (userId: string, coinsGained: number, statsUpdate: any) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Update Coins & Stats
    user.amitaiCoins += coinsGained;

    // Weekly Coins Logic
    const currentWeekInfo = getWeekNumber(new Date());
    const weekString = `${currentWeekInfo[0]}-W${currentWeekInfo[1]}`;

    if (user.currentWeek !== weekString) {
        user.weeklyCoins = coinsGained;
        user.currentWeek = weekString;
    } else {
        user.weeklyCoins = (user.weeklyCoins || 0) + coinsGained;
    }

    if (statsUpdate) {
        user.stats.totalInterviews += statsUpdate.interviews || 0;
        user.stats.totalCodeLines += statsUpdate.codeLines || 0;

        if (statsUpdate.newScore) {
            const currentAvg = user.stats.averageScore || 0;
            const count = user.stats.totalInterviews;
            if (count > 0) {
                const previousCount = count - (statsUpdate.interviews || 0);
                if (previousCount >= 0) {
                    user.stats.averageScore = ((currentAvg * previousCount) + statsUpdate.newScore) / count;
                }
            } else {
                user.stats.averageScore = statsUpdate.newScore;
            }
        }
    }

    // Level Up Logic (using coins)
    const nextLevelCoins = user.level * COINS_PER_LEVEL_BASE * 2;
    let leveledUp = false;
    if (user.amitaiCoins >= nextLevelCoins) {
        user.level += 1;
        leveledUp = true;
    }

    const now = new Date();
    user.lastPracticeDate = now;

    // Badge Logic via Service
    const context = {
        ...statsUpdate,
        timestamp: now
    };

    function getWeekNumber(d: Date) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        var weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        return [d.getUTCFullYear(), weekNo];
    }

    const newAchievements = checkBadges(user, context);

    await user.save();

    return {
        level: user.level,
        amitaiCoins: user.amitaiCoins,
        leveledUp,
        newAchievements
    };
};
