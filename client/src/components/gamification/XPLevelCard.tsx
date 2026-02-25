
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

interface XPLevelCardProps {
    user: any;
}

const XPLevelCard: React.FC<XPLevelCardProps> = ({ user }) => {
    const level = user.level || 1;
    const currentXP = user.xp || 0;
    const nextLevelXP = level * 1000 * 1.5;
    const progress = Math.min(100, (currentXP / nextLevelXP) * 100);

    return (
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-600/20 border-blue-500/20 rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />

            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Current Level</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-white">{level}</span>
                            <span className="text-blue-400 font-bold mb-1">Learner</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                        <Trophy className="w-6 h-6 text-blue-400" />
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                    <div className="flex justify-between text-xs font-semibold mb-2">
                        <span className="text-blue-200">{currentXP} XP</span>
                        <span className="text-zinc-500">{Math.round(nextLevelXP)} XP</span>
                    </div>
                    <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        />
                    </div>
                </div>

                <p className="text-xs text-blue-300/60 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {Math.round(nextLevelXP - currentXP)} XP to next level
                </p>
            </CardContent>
        </Card>
    );
};

export default XPLevelCard;
