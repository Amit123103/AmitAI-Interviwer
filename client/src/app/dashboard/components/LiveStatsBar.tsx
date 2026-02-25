"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mic, Code2, Clock, Globe, Flame, TrendingUp } from "lucide-react"

interface LiveStatsBarProps {
    stats: any
    user: any
}

function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (target === 0) return
        const duration = 1800
        const steps = 40
        const increment = target / steps
        let current = 0
        const timer = setInterval(() => {
            current += increment
            if (current >= target) {
                setCount(target)
                clearInterval(timer)
            } else {
                setCount(Math.floor(current))
            }
        }, duration / steps)
        return () => clearInterval(timer)
    }, [target])

    return <span>{prefix}{count.toLocaleString()}{suffix}</span>
}

export default function LiveStatsBar({ stats, user }: LiveStatsBarProps) {
    const totalInterviews = stats?.totalInterviews || 0
    const problemsSolved = user?.problemsSolved || 0
    const hoursPracticed = stats?.totalHours || 0
    const globalRank = user?.rank || 0
    const streak = user?.streak || 0
    const avgScore = stats?.averageScore || 0

    const metrics = [
        { icon: <Mic className="w-3.5 h-3.5" />, label: "Interviews", value: totalInterviews, suffix: "", color: "text-rose-400", glow: "bg-rose-500/10", border: "border-rose-500/20" },
        { icon: <Code2 className="w-3.5 h-3.5" />, label: "Problems", value: problemsSolved, suffix: "", color: "text-orange-400", glow: "bg-orange-500/10", border: "border-orange-500/20" },
        { icon: <Clock className="w-3.5 h-3.5" />, label: "Hours", value: hoursPracticed, suffix: "h", color: "text-amber-400", glow: "bg-amber-500/10", border: "border-amber-500/20" },
        { icon: <Flame className="w-3.5 h-3.5" />, label: "Streak", value: streak, suffix: "d", color: "text-emerald-400", glow: "bg-emerald-500/10", border: "border-emerald-500/20" },
        { icon: <TrendingUp className="w-3.5 h-3.5" />, label: "Avg Score", value: avgScore, suffix: "%", color: "text-blue-400", glow: "bg-blue-500/10", border: "border-blue-500/20" },
        { icon: <Globe className="w-3.5 h-3.5" />, label: "Rank", value: globalRank, prefix: "#", suffix: "", color: "text-violet-400", glow: "bg-violet-500/10", border: "border-violet-500/20" },
    ]

    return (
        <div className="relative overflow-hidden rounded-2xl bg-zinc-950/40 backdrop-blur-3xl border border-white/10 p-6">
            {/* Rainbow gradient top edge */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-rose-500 via-amber-500 via-emerald-500 via-blue-500 to-violet-500" />

            <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-300">
                    Your Stats
                </h3>
                <div className="flex items-center gap-1.5 ml-auto">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] text-emerald-400 font-medium">Live</span>
                </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {metrics.map((m, i) => (
                    <motion.div
                        key={m.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        className={`flex flex-col items-center p-3 rounded-xl ${m.glow} border ${m.border} hover:scale-105 transition-transform cursor-default group`}
                    >
                        <div className={`${m.color} mb-1.5 group-hover:scale-110 transition-transform`}>{m.icon}</div>
                        <div className={`text-lg font-bold ${m.color}`}>
                            <AnimatedCounter target={m.value} suffix={m.suffix} prefix={m.prefix} />
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5 font-medium">{m.label}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
