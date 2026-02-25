
import React from 'react';
import XPLevelCard from './XPLevelCard';
import StreakFlame from './StreakFlame';
import DailyMissions from './DailyMissions';
import BadgeGrid from './BadgeGrid';

interface GamificationPanelProps {
    user: any; // Using any for now to match dashboard state, can be typed properly
}

const GamificationPanel: React.FC<GamificationPanelProps> = ({ user }) => {
    if (!user) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
            {/* XP & Level - Large Card */}
            <div className="md:col-span-4 lg:col-span-3">
                <XPLevelCard user={user} />
            </div>

            {/* Streak & Stats */}
            <div className="md:col-span-3 lg:col-span-2">
                <StreakFlame streak={user.streak || 0} lastPracticeDate={user.lastPracticeDate} />
            </div>

            {/* Daily Missions */}
            <div className="md:col-span-5 lg:col-span-4">
                <DailyMissions missions={user.dailyMissions || []} />
            </div>

            {/* Badges - Hidden on smaller screens or stacked */}
            <div className="hidden lg:block lg:col-span-3">
                <BadgeGrid achievements={user.achievements || []} />
            </div>
        </div>
    );
};

export default GamificationPanel;
