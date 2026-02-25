"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Star, Zap, ArrowRight } from "lucide-react"

const SUCCESS_DATA = [
    { id: 1, user: "Amit S.", company: "Google", role: "Software Engineer", event: "Cleared Technical Round", score: "94%" },
    { id: 2, user: "Priya K.", company: "Amazon", role: "SDE-1", event: "Received Offer", score: "Professional" },
    { id: 3, user: "Rahul M.", company: "Microsoft", role: "Frontend Dev", event: "Mastered System Design", score: "Elite" },
    { id: 4, user: "Sneha P.", company: "Netflix", role: "Backend Architect", event: "Cleared Behavioral Round", score: "98%" },
    { id: 5, user: "Vikram R.", company: "Meta", role: "Fullstack Eng", event: "High Stress Resilience", score: "Top 1%" },
]

export default function SuccessWall() {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % SUCCESS_DATA.length)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    const item = SUCCESS_DATA[index]

    return (
        <div className="w-full relative overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900/40 backdrop-blur-2xl">
            {/* Gradient top line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

            {/* Ambient glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-[50px] pointer-events-none" />

            <div className="relative p-4 md:p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="w-11 h-11 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-xl flex items-center justify-center border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                            <Zap className="text-violet-400 w-5 h-5" />
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                                    Success Wall
                                </h3>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400/70">Live</span>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                                    transition={{ duration: 0.4 }}
                                    className="flex items-center gap-2 flex-wrap"
                                >
                                    <span className="font-black text-white text-sm">{item.user}</span>
                                    <ArrowRight className="w-3 h-3 text-zinc-600" />
                                    <span className="text-zinc-500 text-xs font-medium">{item.event}</span>
                                    <span className="text-zinc-700 text-xs">at</span>
                                    <span className="font-black text-sm bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-tight">
                                        {item.company}
                                    </span>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Score</span>
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={item.id}
                                    initial={{ scale: 0.6, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-lg font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent"
                                >
                                    {item.score}
                                </motion.span>
                            </AnimatePresence>
                        </div>

                        <div className="h-8 w-px bg-white/[0.06]" />

                        <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]" />
                            ))}
                        </div>

                        {/* Progress dots */}
                        <div className="flex items-center gap-1.5">
                            {SUCCESS_DATA.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === index
                                        ? 'bg-violet-400 shadow-[0_0_6px_rgba(139,92,246,0.5)] scale-125'
                                        : 'bg-zinc-800'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
