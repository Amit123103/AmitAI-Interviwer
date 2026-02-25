"use client"

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { Flame, Zap, Calendar, TrendingUp, Award } from "lucide-react"

interface StreakFlameProps {
    user: any
}

export default function StreakFlame({ user }: StreakFlameProps) {
    const streak = user?.streak || 0
    const longestStreak = user?.longestStreak || Math.max(streak, 7)
    const xpToday = user?.xpToday || 120

    const flameIntensity = useMemo(() => {
        if (streak >= 30) return { level: "INFERNO", color: "from-red-500 to-orange-400", glow: "shadow-red-500/30", particles: 12, msg: "You're absolutely unstoppable!" }
        if (streak >= 14) return { level: "BLAZING", color: "from-orange-500 to-amber-400", glow: "shadow-orange-500/30", particles: 8, msg: "Incredible momentum — keep it alive!" }
        if (streak >= 7) return { level: "HOT", color: "from-amber-500 to-yellow-400", glow: "shadow-amber-500/25", particles: 5, msg: "One week strong! Don't break the chain." }
        if (streak >= 3) return { level: "WARMING", color: "from-yellow-500 to-lime-400", glow: "shadow-yellow-500/20", particles: 3, msg: "Building momentum — 3+ days running!" }
        return { level: "SPARK", color: "from-zinc-400 to-zinc-300", glow: "shadow-zinc-400/10", particles: 1, msg: "Start your streak today!" }
    }, [streak])

    return (
        <div className="relative overflow-hidden rounded-2xl bg-zinc-950/40 backdrop-blur-3xl border border-white/10 p-8 group">
            {/* Rainbow accent bar */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-500 via-orange-500 via-amber-400 to-yellow-300" />
            {/* Ambient heat glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${flameIntensity.color} opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-700`} />

            {/* Floating fire particles */}
            {Array.from({ length: flameIntensity.particles }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-orange-400/40"
                    style={{
                        left: `${15 + (i * 70) / flameIntensity.particles}%`,
                        bottom: '20%'
                    }}
                    animate={{
                        y: [0, -80 - Math.random() * 60],
                        opacity: [0.6, 0],
                        scale: [1, 0.3],
                    }}
                    transition={{
                        duration: 2 + Math.random() * 1.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeOut",
                    }}
                />
            ))}

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${flameIntensity.color} flex items-center justify-center shadow-xl ${flameIntensity.glow}`}>
                            <Flame className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Streak Flame</h3>
                            <p className="text-xs text-zinc-500">Keep your momentum going</p>
                        </div>
                    </div>
                    <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/20">
                        <span className={`text-[10px] font-black uppercase tracking-widest bg-gradient-to-r ${flameIntensity.color} bg-clip-text text-transparent`}>
                            {flameIntensity.level}
                        </span>
                    </div>
                </div>

                {/* Main Streak Display */}
                <div className="flex items-center gap-8 mb-8">
                    <div className="relative">
                        <motion.div
                            className={`text-7xl font-black italic bg-gradient-to-b ${flameIntensity.color} bg-clip-text text-transparent`}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", bounce: 0.4 }}
                        >
                            {streak}
                        </motion.div>
                        <div className="text-xs text-zinc-500 text-center font-medium">Day Streak</div>
                    </div>
                    <div className="flex-1 space-y-3">
                        <p className="text-sm text-zinc-300 font-bold italic leading-relaxed">"{flameIntensity.msg}"</p>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full bg-gradient-to-r ${flameIntensity.color} rounded-full`}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((streak / 30) * 100, 100)}%` }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-zinc-600">
                            <span>Day 0</span>
                            <span className="text-orange-400 font-medium">30-day goal</span>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { icon: <Calendar className="w-3.5 h-3.5" />, label: "Current", value: `${streak} days`, color: "text-orange-400" },
                        { icon: <Award className="w-3.5 h-3.5" />, label: "Longest", value: `${longestStreak} days`, color: "text-amber-400" },
                        { icon: <Zap className="w-3.5 h-3.5" />, label: "XP Today", value: `+${xpToday}`, color: "text-yellow-400" },
                    ].map((stat) => (
                        <div key={stat.label} className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/20 transition-colors group/stat">
                            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 group-hover/stat:text-orange-400 transition-colors mb-2">
                                {stat.icon}
                            </div>
                            <div className="text-[11px] text-zinc-500 font-medium">{stat.label}</div>
                            <div className={`text-sm font-black ${stat.color}`}>{stat.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
