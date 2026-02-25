"use client"

import React from "react"
import { motion } from "framer-motion"
import { Mic, Play, Radio, Brain, Sparkles } from "lucide-react"
import Link from "next/link"

export default function InterviewSimPreview() {
    // Animated waveform bars
    const bars = Array.from({ length: 24 }, (_, i) => ({
        id: i,
        height: 8 + Math.random() * 28,
        delay: i * 0.05,
    }))

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/10 via-zinc-950/40 to-cyan-500/10 backdrop-blur-3xl border border-violet-500/20 p-8 group hover:border-violet-400/30 transition-all duration-500">
            {/* Rainbow accent bar */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 via-cyan-400 via-emerald-400 to-amber-400" />
            {/* Background pulse */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-cyan-500/5"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Scanning line */}
            <motion.div
                className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent"
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/30 to-cyan-500/30 flex items-center justify-center border border-violet-500/20">
                                <Brain className="w-6 h-6 text-violet-400" />
                            </div>
                            {/* Pulsing ring */}
                            <motion.div
                                className="absolute inset-0 rounded-2xl border-2 border-violet-500/40"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">AI Interviewer</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-medium text-emerald-400">Ready</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <Radio className="w-3 h-3 text-primary" />
                        <span className="text-xs font-medium text-primary">Live</span>
                    </div>
                </div>

                {/* Waveform */}
                <div className="flex items-center justify-center gap-[3px] h-14 mb-6 px-4">
                    {bars.map((bar) => (
                        <motion.div
                            key={bar.id}
                            className="w-[3px] rounded-full bg-gradient-to-t from-violet-500/60 to-cyan-400/80"
                            animate={{
                                height: [bar.height * 0.3, bar.height, bar.height * 0.5, bar.height * 0.8, bar.height * 0.3],
                            }}
                            transition={{
                                duration: 1.5 + Math.random(),
                                repeat: Infinity,
                                delay: bar.delay,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                        <div className="text-[10px] font-medium text-zinc-500 mb-1">Mode</div>
                        <div className="text-xs font-semibold text-white">Behavioral</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                        <div className="text-[10px] font-medium text-zinc-500 mb-1">Difficulty</div>
                        <div className="text-xs font-semibold text-amber-400">Medium</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                        <div className="text-[10px] font-medium text-zinc-500 mb-1">Duration</div>
                        <div className="text-xs font-semibold text-cyan-400">15 min</div>
                    </div>
                </div>

                {/* CTA */}
                <Link href="/interview/setup">
                    <button className="w-full h-14 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group/btn">
                        <Play className="w-5 h-5 fill-current group-hover/btn:scale-110 transition-transform" />
                        <span>Start interview</span>
                        <Sparkles className="w-4 h-4 opacity-60" />
                    </button>
                </Link>
            </div>
        </div>
    )
}
