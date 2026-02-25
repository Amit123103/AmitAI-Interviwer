
import React from 'react';
import { Check, Target, Zap, Code2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Mission {
    id: string;
    type: string;
    target: number;
    progress: number;
    completed: boolean;
}

interface DailyMissionsProps {
    missions: Mission[];
}

const DailyMissions: React.FC<DailyMissionsProps> = ({ missions }) => {

    const getIcon = (type: string) => {
        switch (type) {
            case 'practice': return <Target className="w-4 h-4 text-blue-400" />;
            case 'code': return <Code2 className="w-4 h-4 text-purple-400" />;
            case 'streak': return <Zap className="w-4 h-4 text-orange-400" />;
            default: return <Target className="w-4 h-4 text-zinc-400" />;
        }
    };

    const getLabel = (type: string, target: number) => {
        switch (type) {
            case 'practice': return `Complete ${target} Practice Session${target > 1 ? 's' : ''}`;
            case 'questions': return `Answer ${target} Question${target > 1 ? 's' : ''}`;
            case 'streak': return `Maintain Daily Streak`;
            default: return `Complete Mission`;
        }
    };

    return (
        <Card className="bg-zinc-900/50 border-white/5 h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-500" />
                    Daily Missions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {missions && missions.length > 0 ? (
                    missions.map((mission) => (
                        <div key={mission.id} className="group">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${mission.completed ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                                        {mission.completed ? <Check className="w-4 h-4 text-emerald-500" /> : getIcon(mission.type)}
                                    </div>
                                    <div className='flex flex-col'>
                                        <span className={`text-sm font-medium ${mission.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                                            {getLabel(mission.type, mission.target)}
                                        </span>
                                        <span className="text-[10px] text-zinc-500">
                                            {mission.progress} / {mission.target}
                                        </span>
                                    </div>
                                </div>
                                {mission.completed && (
                                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                        +50 XP
                                    </span>
                                )}
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${mission.completed ? 'bg-emerald-500' : 'bg-primary'}`}
                                    style={{ width: `${Math.min(100, (mission.progress / mission.target) * 100)}%` }}
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-zinc-500 text-xs text-center py-4">
                        All missions completed for today!
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default DailyMissions;
