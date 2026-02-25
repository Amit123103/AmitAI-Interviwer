"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Flame, Target, Trophy, CheckCircle2 } from "lucide-react"

interface Goal {
    id: string;
    label: string;
    current: number;
    target: number;
    color: string;
}

export default function DailyGoals() {
    const [streak, setStreak] = useState(12)
    const [goals, setGoals] = useState<Goal[]>([
        { id: "interviews", label: "Interviews", current: 2, target: 3, color: "from-orange-500 to-red-500" },
        { id: "coding", label: "Code Problems", current: 4, target: 5, color: "from-pink-500 to-rose-500" },
        { id: "behavioral", label: "Aptitude Quiz", current: 1, target: 1, color: "from-amber-400 to-orange-500" }
    ])

    useEffect(() => {
        const saved = localStorage.getItem("daily_goals")
        if (saved) {
            // In a real app, we'd sync this with the backend
        }
    }, [])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Streak & Overall Progress */}
            <div className="lg:col-span-1 bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -z-10 group-hover:bg-orange-500/20 transition-all duration-700" />

                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.2)] group-hover:shadow-[0_0_50px_rgba(249,115,22,0.4)] transition-all duration-500">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <Flame className="w-12 h-12 text-orange-500 fill-current" />
                            </motion.div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-black rounded-lg flex items-center justify-center font-bold text-xs shadow-xl rotate-12">
                            x{streak}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold text-white">Practice Streak</h3>
                        <p className="text-xs text-zinc-500 mt-1">Keep the momentum going!</p>
                    </div>

                    <div className="w-full pt-4">
                        <div className="flex justify-between items-center mb-2 text-xs text-zinc-400">
                            <span>Daily progress</span>
                            <span className="text-orange-500 font-semibold">72%</span>
                        </div>
                        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: "72%" }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Individual Goals */}
            <div className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Today's Goals</h3>
                        <p className="text-xs text-zinc-500">Complete these to earn bonus XP</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {goals.map((goal, idx) => {
                        const isDone = goal.current >= goal.target
                        const percent = (goal.current / goal.target) * 100

                        return (
                            <motion.div
                                key={goal.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative flex flex-col items-center group/goal"
                            >
                                <div className="relative w-20 h-20 mb-4">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle
                                            cx="40" cy="40" r="36"
                                            className="stroke-white/5 fill-none"
                                            strokeWidth="6"
                                        />
                                        <motion.circle
                                            cx="40" cy="40" r="36"
                                            className={`fill-none ${isDone ? 'stroke-emerald-500' : 'stroke-primary'}`}
                                            strokeWidth="6"
                                            strokeLinecap="round"
                                            initial={{ strokeDasharray: "226", strokeDashoffset: "226" }}
                                            animate={{ strokeDashoffset: 226 - (226 * percent) / 100 }}
                                            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 + idx * 0.1 }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {isDone ? (
                                            <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-in zoom-in duration-500" />
                                        ) : (
                                            <span className="text-xs font-bold text-white">
                                                {goal.current}/{goal.target}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className={`text-xs font-medium mb-1 ${isDone ? 'text-emerald-400' : 'text-zinc-400'}`}>
                                        {goal.label}
                                    </p>
                                    {isDone && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="inline-flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20"
                                        >
                                            <Trophy className="w-2.5 h-2.5 text-emerald-500" />
                                            <span className="text-[10px] font-semibold text-emerald-500">+Bonus XP</span>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
