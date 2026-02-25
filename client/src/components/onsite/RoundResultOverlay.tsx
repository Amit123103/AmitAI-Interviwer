
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronRight, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface RoundResultProps {
    isOpen: boolean;
    scores: {
        technical: number;
        communication: number;
        cultural: number;
    };
    feedback: {
        pros: string[];
        cons: string[];
        summary: string;
    };
    onNext: () => void;
}

const RoundResultOverlay: React.FC<RoundResultProps> = ({ isOpen, scores, feedback, onNext }) => {
    if (!isOpen) return null;

    const averageScore = Math.round((scores.technical + scores.communication + scores.cultural) / 3);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="w-full max-w-2xl"
                >
                    <Card className="bg-zinc-950 border-zinc-800 shadow-2xl overflow-hidden relative">
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/20 blur-3xl pointer-events-none" />

                        <CardHeader className="text-center pb-2 relative z-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30"
                            >
                                <Trophy className="w-8 h-8 text-primary" />
                            </motion.div>
                            <CardTitle className="text-2xl font-bold text-white">Round Complete!</CardTitle>
                            <CardDescription>Here's how you performed in this session.</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6 relative z-10">
                            {/* Scores Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 text-center">
                                    <div className="text-xs font-bold uppercase text-zinc-500 mb-1">Technical</div>
                                    <div className="text-2xl font-black text-blue-400">{scores.technical}%</div>
                                </div>
                                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 text-center">
                                    <div className="text-xs font-bold uppercase text-zinc-500 mb-1">Communication</div>
                                    <div className="text-2xl font-black text-purple-400">{scores.communication}%</div>
                                </div>
                                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 text-center">
                                    <div className="text-xs font-bold uppercase text-zinc-500 mb-1">Culture Fit</div>
                                    <div className="text-2xl font-black text-emerald-400">{scores.cultural}%</div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-zinc-900/30 p-4 rounded-xl border border-white/5">
                                <h4 className="text-sm font-bold text-zinc-300 mb-2 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-yellow-500" />
                                    AI Feedback
                                </h4>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    {feedback.summary}
                                </p>
                            </div>

                            {/* Detailed Feedback */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h5 className="text-xs font-bold uppercase text-emerald-500 mb-2 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Strengths
                                    </h5>
                                    <ul className="space-y-1">
                                        {feedback.pros.map((pro, i) => (
                                            <li key={i} className="text-xs text-zinc-400 pl-2 border-l-2 border-emerald-500/20">
                                                {pro}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="text-xs font-bold uppercase text-red-500 mb-2 flex items-center gap-1">
                                        <XCircle className="w-3 h-3" /> Areas to Improve
                                    </h5>
                                    <ul className="space-y-1">
                                        {feedback.cons.map((con, i) => (
                                            <li key={i} className="text-xs text-zinc-400 pl-2 border-l-2 border-red-500/20">
                                                {con}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="justify-center pt-2 relative z-10">
                            <Button onClick={onNext} size="lg" className="w-full md:w-auto min-w-[200px] font-bold">
                                Proceed to Next Round <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default RoundResultOverlay;
