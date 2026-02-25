import User from '../models/User';
import { checkBadges } from './badgeService';

const XP_PER_LEVEL_BASE = 1000;

export const updateUserProgress = async (userId: string, xpGained: number, statsUpdate: any) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Update XP & Stats
    user.xp += xpGained;

    // Weekly XP Logic
    const currentWeekInfo = getWeekNumber(new Date());
    const weekString = `${currentWeekInfo[0]}-W${currentWeekInfo[1]}`;

    if (user.currentWeek !== weekString) {
        user.weeklyXp = xpGained;
        user.currentWeek = weekString;
    } else {
        user.weeklyXp = (user.weeklyXp || 0) + xpGained;
    }

    if (statsUpdate) {
        user.stats.totalInterviews += statsUpdate.interviews || 0;
        user.stats.totalCodeLines += statsUpdate.codeLines || 0;

        // Simple moving average for score
        if (statsUpdate.newScore) {
            const currentAvg = user.stats.averageScore || 0;
            const count = user.stats.totalInterviews; // This is the NEW count (already incremented above? NO, wait.)

            // Wait, previous logic was:
            // user.stats.totalInterviews += statsUpdate.interviews || 0;
            // then calculate average.
            // If I just kept the old logic:

            // Re-implementing clearer logic:
            // If interviews incremented, the average calculation needs to account for the new item.
            // If totalInterviews is 1, it means this is the first one.
            if (count > 0) {
                // Weighted average: (OldAvg * (Count - 1) + NewVal) / Count
                const previousCount = count - (statsUpdate.interviews || 0);
                if (previousCount >= 0) {
                    user.stats.averageScore = ((currentAvg * previousCount) + statsUpdate.newScore) / count;
                }
            } else {
                // Should not happen if we incremented, but safely:
                user.stats.averageScore = statsUpdate.newScore;
            }
        }
    }

    // Level Up Logic
    const nextLevelXp = user.level * XP_PER_LEVEL_BASE * 1.5;
    let leveledUp = false;
    if (user.xp >= nextLevelXp) {
        user.level += 1;
        leveledUp = true;
    }

    // Streak Logic
    const now = new Date();
    const lastDate = user.lastPracticeDate ? new Date(user.lastPracticeDate) : null;
    let streakIncremented = false;

    if (lastDate) {
        const diffTime = Math.abs(now.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Difference in days

        // Logic check: if lastDate was yesterday (diffDays approx 1), increment.
        // If lastDate was today (diffDays 0), do nothing.
        // If lastDate was > 1 day ago, reset.

        // Better logic: compare actual calendar dates to avoid 23h vs 25h issues
        const isSameDay = now.toDateString() === lastDate.toDateString();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = yesterday.toDateString() === lastDate.toDateString();

        if (isYesterday) {
            user.streak += 1;
            streakIncremented = true;
        } else if (!isSameDay) {
            user.streak = 1; // Broken streak or first day back
            streakIncremented = true;
        }
    } else {
        user.streak = 1;
        streakIncremented = true;
    }

    // Update maxStreak
    if (user.streak > (user.maxStreak || 0)) {
        user.maxStreak = user.streak;
    }

    user.lastPracticeDate = now;

    // Badge Logic via Service
    // Pass context from statsUpdate
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
        xp: user.xp,
        streak: user.streak,
        leveledUp,
        newAchievements
    };
};
