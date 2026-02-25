
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Calendar } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

interface StreakFlameProps {
    streak: number;
    lastPracticeDate: string | null;
}

const StreakFlame: React.FC<StreakFlameProps> = ({ streak, lastPracticeDate }) => {
    // Determine flame intensity based on streak
    // 0-3 days: Small flame
    // 4-7 days: Medium flame
    // 8+ days: Large raging flame

    const getFlameColor = () => {
        if (streak >= 14) return "text-purple-500";
        if (streak >= 7) return "text-orange-500";
        return "text-yellow-500";
    };

    const isToday = (dateString: string | null) => {
        if (!dateString) return false;
        const today = new Date().toDateString();
        const date = new Date(dateString).toDateString();
        return today === date;
    };

    const hasPracticedToday = isToday(lastPracticeDate);

    return (
        <Card className="bg-zinc-900/50 border-white/5 relative overflow-hidden h-full">
            <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                <div className="relative mb-4">
                    {/* Flame Animation */}
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.8, 1, 0.8],
                            filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className={`w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center ${hasPracticedToday ? 'shadow-[0_0_20px_rgba(249,115,22,0.6)]' : ''}`}
                    >
                        <Zap className={`w-8 h-8 fill-current ${getFlameColor()}`} />
                    </motion.div>
                </div>

                <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-1">{streak}</div>
                    <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">Day Streak</div>

                    {hasPracticedToday ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                            Streak Active
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Practice to keep flame
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default StreakFlame;
