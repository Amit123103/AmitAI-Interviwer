"use client"

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { Sparkles, Sun, Zap, Target, Trophy } from "lucide-react"

interface SarahBriefingProps {
    user: any
    stats: any
}

export default function SarahBriefing({ user, stats }: SarahBriefingProps) {
    const greeting = useMemo(() => {
        const hour = new Date().getHours()
        if (hour < 12) return "Good morning"
        if (hour < 17) return "Good afternoon"
        return "Good evening"
    }, [])

    const briefing = useMemo(() => {
        if (!stats) return "Ready for another practice session? Let's pick up where you left off."

        const latestScore = stats.progressData?.[stats.progressData.length - 1]?.technical || 0
        const commScore = stats.progressData?.[stats.progressData.length - 1]?.communication || 0

        if (latestScore > 85 && commScore > 85) {
            return "You're performing exceptionally well across the board! Try a high-pressure stress test or a mock leadership interview next."
        } else if (latestScore > 80) {
            return "Your technical skills are solid. Let's shift focus to system design or architectural scalability today."
        } else if (commScore < 60 && latestScore > 0) {
            return "Great technical skills! Your communication score could use some work — try an 'Articulating Complex Ideas' session today."
        } else if (latestScore > 0 && latestScore < 65) {
            return "Nice effort! Let's drill into your weak areas. We've lined up a DS & Algorithms review for you."
        }

        return "Welcome! We've analyzed your profile and prepared a personalized roadmap to help you ace your next big role."
    }, [stats])

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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden group"
        >
            <div className="bg-zinc-950/40 backdrop-blur-3xl border border-white/10 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start md:items-center shadow-2xl relative overflow-hidden">
                {/* Rainbow accent bar */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-rose-500 via-amber-500 via-emerald-500 via-blue-500 to-violet-500" />

                {/* Subtle background glow */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                    <Sun size={120} />
                </div>

                {/* Avatar / Icon */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0 relative group-hover:border-indigo-400/40 transition-colors">
                    <div className="text-4xl md:text-5xl select-none">👋</div>
                </div>

                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-xs font-semibold text-indigo-300">Your daily brief</span>
                        </div>
                        {(user?.streak || 0) > 3 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                <Trophy className="w-3 h-3 text-amber-400" />
                                <span className="text-[11px] font-semibold text-amber-300">{user.streak}-day streak!</span>
                            </div>
                        )}
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight max-w-3xl tracking-tight">
                        {greeting}, <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">{user?.username || "there"}</span>! {briefing}
                    </h2>

                    <div className="flex flex-wrap gap-5 pt-1">
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <Zap className="w-4 h-4 text-amber-500" />
                            Up next: <span className="text-white font-semibold">{nextAction.label}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <Target className="w-4 h-4 text-emerald-500" />
                            Focus area: <span className="text-white font-semibold">{nextAction.area}</span>
                        </div>
                    </div>
                </div>

                {/* Progress bars */}
                <div className="hidden lg:flex flex-col items-start gap-4 pl-10 border-l border-white/10 min-w-[240px]">
                    <div className="space-y-1.5 w-full">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-medium text-zinc-400">Overall Progress</span>
                            <span className="text-sm font-bold text-indigo-400">{overallProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${overallProgress}%` }}
                                transition={{ duration: 1.5 }}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 w-full">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-medium text-zinc-400">Confidence Score</span>
                            <span className="text-sm font-bold text-emerald-400">{confidenceScore}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${confidenceScore}%` }}
                                transition={{ duration: 1.5 }}
                            />
                        </div>
                    </div>

                    <div className="pt-1 w-full flex justify-between items-center">
                        <span className="text-[11px] text-zinc-500 font-medium">Updated just now</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
