"use client"

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { Sparkles, Sun, Zap, Target, Trophy } from "lucide-react"

interface SarahBriefingProps {
    user: any
    stats: any
}

export default function SarahBriefing({ user, stats }: SarahBriefingProps) {
    const greetingBase = useMemo(() => {
        const hour = new Date().getHours()
        if (hour < 12) return "Good morning"
        if (hour < 17) return "Good afternoon"
        return "Good evening"
    }, [])

    const slogan = useMemo(() => {
        const slogans = [
            "Tech Visionary",
            "Future Builder",
            "Placement Pioneer",
            "Architect of Tomorrow"
        ]
        return slogans[Math.floor(Math.random() * slogans.length)]
    }, [])

    const briefing = useMemo(() => {
        return "Stay consistent. Your future self will thank you."
    }, [])

    const nextAction = useMemo(() => {
        if (!stats) return { label: "System Design", area: "Scalability" }
        const latestTech = stats.progressData?.[stats.progressData.length - 1]?.technical || 0
        if (latestTech > 80) return { label: "Leadership", area: "Conflict Resolution" }
        if (latestTech < 60) return { label: "Tech Basics", area: "Data Structures" }
        return { label: "Mock Interview", area: "Behavioral" }
    }, [stats])

    const overallProgress = useMemo(() => {
        if (!stats?.progressData?.length) return 78
        const last = stats.progressData[stats.progressData.length - 1]
        return Math.round((last.technical + (last.communication || 70)) / 2)
    }, [stats])

    const confidenceScore = useMemo(() => {
        if (!stats?.progressData?.length) return 92
        const last = stats.progressData[stats.progressData.length - 1]
        return Math.min(99, Math.round(last.technical * 1.05))
    }, [stats])

    return (
        <div className="relative w-full h-full">
            <div className="neural-card p-10 md:p-12 lg:p-14 h-full bg-slate-900/40 backdrop-blur-2xl border border-white/5 shadow-2xl group overflow-visible">

                {/* Responsive Grid Flow - No Overlap */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

                    {/* Visual Anchor (Col 1-2) */}
                    <div className="lg:col-span-2 flex justify-center lg:justify-start">
                        <div className="relative">
                            <motion.div
                                className="w-28 h-28 md:w-32 md:h-32 rounded-[1.5rem] bg-slate-900/50 border border-white/10 flex items-center justify-center shadow-xl relative z-10 overflow-hidden"
                                whileHover={{ rotate: 5, scale: 1.05 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent" />
                                <motion.div
                                    className="text-6xl md:text-7xl select-none"
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2.5, repeat: Infinity }}
                                >
                                    👋
                                </motion.div>
                            </motion.div>
                            <div className="absolute -inset-2 bg-blue-500/10 blur-2xl rounded-full opacity-30" />
                        </div>
                    </div>

                    {/* Main Content (Col 3-8) */}
                    <div className="lg:col-span-6 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Learning System Synced</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                                    {greetingBase}, <span className="text-blue-500">{user?.username || "Amit"}</span>
                                </h2>
                                <p className="text-sm md:text-base font-bold text-blue-500/60 tracking-[0.2em] uppercase">
                                    {slogan}
                                </p>
                            </div>
                            <p className="text-slate-400 text-base md:text-lg font-medium leading-relaxed max-w-xl">
                                Your progress is on track. <br />
                                <span className="text-white/70 italic">Stay consistent. Your future self will thank you.</span>
                            </p>
                        </div>

                        {/* Integrated Milestone Hud */}
                        <div className="p-7 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all group/ms relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover/ms:bg-blue-500/20 transition-colors">
                                    <Zap className="w-6 h-6 text-blue-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Current Milestone</span>
                                    <span className="text-white text-lg font-bold tracking-tight">Master Tech Fundamentals</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: "65%" }}
                                        transition={{ duration: 2 }}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                    <div className="flex flex-col">
                                        <span className="text-blue-500">65% Completed</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-slate-500">Est. 2h 15m remaining</span>
                                    </div>
                                </div>
                                <button className="w-full py-3.5 rounded-2xl bg-blue-600 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg active:scale-[0.98]">
                                    Continue Learning →
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats HUD (Col 9-12) - Integrated & Visible */}
                    <div className="lg:col-span-4 space-y-6 lg:pl-10 lg:border-l lg:border-white/5 self-center">
                        <div className="space-y-6 p-6 rounded-[2rem] bg-white/[0.01] border border-white/5">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Skill Alignment</span>
                                        <span className="text-2xl font-bold text-white">{overallProgress}%</span>
                                    </div>
                                    <Trophy className="w-5 h-5 text-blue-500/50" />
                                </div>
                                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                                        style={{ width: `${overallProgress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Role Readiness</span>
                                        <span className="text-2xl font-bold text-white">{confidenceScore}%</span>
                                    </div>
                                    <Target className="w-5 h-5 text-blue-500/50" />
                                </div>
                                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                                        style={{ width: `${confidenceScore}%` }}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-center text-emerald-500">
                                Placement Ready
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
