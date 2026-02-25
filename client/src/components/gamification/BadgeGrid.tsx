
import React from 'react';
import { Award, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt?: string;
}

interface BadgeGridProps {
    achievements: Achievement[];
}

const BadgeGrid: React.FC<BadgeGridProps> = ({ achievements }) => {
    // Determine recent unlocks vs locked
    // For now, just show what we have, maybe minimal placeholders

    return (
        <Card className="bg-zinc-900/50 border-white/5 h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    Badges & Trophies
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-4 gap-3">
                    {achievements && achievements.length > 0 ? (
                        achievements.map((badge) => (
                            <TooltipProvider key={badge.id}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className="aspect-square rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center hover:bg-yellow-500/20 transition-colors cursor-help">
                                            <Award className="w-6 h-6 text-yellow-500" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-zinc-900 border-zinc-800">
                                        <p className="font-bold text-yellow-500">{badge.name}</p>
                                        <p className="text-xs text-zinc-400">{badge.description}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))
                    ) : (
                        <div className="col-span-4 text-center text-zinc-500 py-4 text-xs">
                            No badges unlocked yet. Keep practicing!
                        </div>
                    )}

                    {/* Placeholders for locked badges */}
                    {Array.from({ length: Math.max(0, 4 - (achievements?.length || 0)) }).map((_, i) => (
                        <div key={`locked-${i}`} className="aspect-square rounded-xl bg-white/5 border border-white/5 flex items-center justify-center opacity-50">
                            <Lock className="w-4 h-4 text-zinc-600" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default BadgeGrid;
