"use client"

import React from "react"
import { motion } from "framer-motion"
import {
    Upload, Brain, MessageSquare, AudioLines, BarChart3,
    FileText, Rocket, Star, Shield, Zap, Target, Sparkles,
    GraduationCap, TrendingUp, Check, ArrowRight,
    Code2, Users, Video, BookOpen
} from "lucide-react"

const STEPS = [
    {
        step: "01",
        title: "UPLOAD YOUR RESUME",
        subtitle: "Smart Document Analysis",
        desc: "Our RAG pipeline parses your resume, extracting skills, projects, and experience into structured neural embeddings. AMITAI learns your unique background in seconds.",
        features: ["PDF & DOCX Support", "Skill Extraction", "Experience Mapping", "Project Deep-Dive"],
        icon: <Upload className="w-7 h-7" />,
        color: "violet",
        illustration: <ResumeIllustration />,
    },
    {
        step: "02",
        title: "AI INTERVIEW BEGINS",
        subtitle: "Adaptive Questioning Engine",
        desc: "AMITAI asks personalized questions based on your profile and target role. It adapts in real-time — if you're strong in system design, it goes deeper. If not, it adjusts difficulty.",
        features: ["Voice Recognition", "Sentiment Analysis", "Adaptive Difficulty", "Real-Time Feedback"],
        icon: <MessageSquare className="w-7 h-7" />,
        color: "blue",
        illustration: <InterviewIllustration />,
    },
    {
        step: "03",
        title: "REAL-TIME ANALYSIS",
        subtitle: "12-Dimensional Evaluation",
        desc: "Every answer is analyzed across 12 critical dimensions — from technical accuracy and communication clarity to confidence level and problem-solving approach.",
        features: ["Voice Tone Analysis", "Confidence Tracking", "Technical Scoring", "Behavioral Assessment"],
        icon: <BarChart3 className="w-7 h-7" />,
        color: "cyan",
        illustration: <AnalyticsIllustration />,
    },
    {
        step: "04",
        title: "GET YOUR REPORT",
        subtitle: "Professional Performance Report",
        desc: "Receive a comprehensive STAR-method report with actionable insights, improvement areas, and a readiness score that predicts your interview success probability.",
        features: ["STAR Method Report", "Improvement Plan", "Readiness Score", "Compare With Peers"],
        icon: <FileText className="w-7 h-7" />,
        color: "emerald",
        illustration: <ReportIllustration />,
    },
]

/* ── CSS-Art Illustrations ── */
function ResumeIllustration() {
    return (
        <div className="relative w-full h-48 flex items-center justify-center">
            {/* Document */}
            <motion.div
                initial={{ rotate: -5 }}
                whileInView={{ rotate: 0 }}
                className="relative w-32 h-40 bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-4 shadow-[0_0_40px_rgba(139,92,246,0.1)]"
            >
                <div className="space-y-2">
                    <div className="h-2 w-16 bg-violet-400/30 rounded-full" />
                    <div className="h-1.5 w-full bg-white/[0.06] rounded-full" />
                    <div className="h-1.5 w-20 bg-white/[0.06] rounded-full" />
                    <div className="h-px w-full bg-white/[0.04] my-2" />
                    <div className="flex gap-1.5">
                        <div className="px-2 py-0.5 bg-violet-500/15 rounded text-[6px] font-bold text-violet-400">React</div>
                        <div className="px-2 py-0.5 bg-blue-500/15 rounded text-[6px] font-bold text-blue-400">Node</div>
                        <div className="px-2 py-0.5 bg-cyan-500/15 rounded text-[6px] font-bold text-cyan-400">AWS</div>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.06] rounded-full" />
                    <div className="h-1.5 w-14 bg-white/[0.06] rounded-full" />
                </div>
                {/* Upload arrow */}
                <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-3 -right-3 w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center"
                >
                    <Upload className="w-3.5 h-3.5 text-violet-400" />
                </motion.div>
            </motion.div>
        </div>
    )
}

function InterviewIllustration() {
    return (
        <div className="relative w-full h-48 flex items-center justify-center gap-6">
            {/* AMITAI */}
            <div className="flex flex-col items-center gap-2">
                <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/30 to-violet-500/30 border border-blue-500/20 flex items-center justify-center"
                >
                    <Brain className="w-6 h-6 text-blue-400" />
                </motion.div>
                <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">AMITAI</span>
            </div>
            {/* Connection waves */}
            <div className="flex items-center gap-1">
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        animate={{ opacity: [0.2, 1, 0.2], scaleY: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                        className="w-1 h-6 bg-gradient-to-b from-blue-400 to-violet-400 rounded-full"
                    />
                ))}
            </div>
            {/* User */}
            <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    <Users className="w-6 h-6 text-cyan-400" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">You</span>
            </div>
        </div>
    )
}

function AnalyticsIllustration() {
    const bars = [85, 92, 78, 96, 88, 72]
    const colors = ["bg-violet-500", "bg-blue-500", "bg-cyan-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"]
    return (
        <div className="relative w-full h-48 flex items-end justify-center gap-3 pb-6">
            {bars.map((h, i) => (
                <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                    className={`w-6 ${colors[i]} rounded-t-lg opacity-50`}
                />
            ))}
            {/* Overlay line chart */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
        </div>
    )
}

function ReportIllustration() {
    return (
        <div className="relative w-full h-48 flex items-center justify-center">
            <motion.div
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                className="relative w-36 h-36 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center"
            >
                {/* Progress ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
                    <motion.circle
                        cx="50" cy="50" r="42" fill="none" stroke="url(#emeraldGrad)" strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                        whileInView={{ strokeDashoffset: 2 * Math.PI * 42 * 0.08 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                    />
                    <defs>
                        <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="text-center">
                    <div className="text-2xl font-black italic text-emerald-400">92%</div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Ready</div>
                </div>
            </motion.div>
        </div>
    )
}

/* ── Features section for each step ── */
const EXTRA_FEATURES = [
    {
        icon: <Code2 className="w-5 h-5" />,
        title: "Live Coding Challenges",
        desc: "Solve algorithmic problems with real-time AI guidance and complexity analysis.",
        color: "text-violet-400",
    },
    {
        icon: <Video className="w-5 h-5" />,
        title: "HD Video Analysis",
        desc: "Body language and micro-expression analysis through advanced computer vision.",
        color: "text-blue-400",
    },
    {
        icon: <BookOpen className="w-5 h-5" />,
        title: "Learning Pathways",
        desc: "Personalized study roadmaps based on your performance gaps and target companies.",
        color: "text-cyan-400",
    },
    {
        icon: <GraduationCap className="w-5 h-5" />,
        title: "Company-Specific Prep",
        desc: "Tailored question banks for FAANG, startups, and enterprise companies.",
        color: "text-emerald-400",
    },
]

export default function HowItWorks() {
    const colorMap: Record<string, { text: string; border: string; bg: string; glow: string }> = {
        violet: { text: "text-violet-400", border: "border-violet-500/20", bg: "bg-violet-500/10", glow: "shadow-[0_0_40px_rgba(139,92,246,0.08)]" },
        blue: { text: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10", glow: "shadow-[0_0_40px_rgba(59,130,246,0.08)]" },
        cyan: { text: "text-cyan-400", border: "border-cyan-500/20", bg: "bg-cyan-500/10", glow: "shadow-[0_0_40px_rgba(6,182,212,0.08)]" },
        emerald: { text: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10", glow: "shadow-[0_0_40px_rgba(16,185,129,0.08)]" },
    }

    return (
        <section className="w-full py-32 relative px-6 overflow-hidden">
            {/* Background accents */}
            <div className="absolute top-[10%] left-0 w-[400px] h-[400px] bg-violet-500/[0.02] blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[10%] right-0 w-[400px] h-[400px] bg-blue-500/[0.02] blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

            <div className="container mx-auto">
                {/* Section Header */}
                <div className="flex flex-col items-center text-center mb-24 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">
                        <Rocket className="w-3 h-3" /> Step-by-Step Journey
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
                        HOW <span className="gradient-text">IT WORKS</span>
                    </h2>
                    <p className="text-zinc-500 max-w-2xl font-medium tracking-tight">
                        From <span className="text-violet-400 font-bold">resume upload</span> to <span className="text-emerald-400 font-bold">interview mastery</span> — four powerful steps to transform your preparation.
                    </p>
                    <div className="h-1 w-20 bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500 rounded-full mt-2" />
                </div>

                {/* Steps */}
                <div className="space-y-16 max-w-6xl mx-auto">
                    {STEPS.map((step, i) => {
                        const c = colorMap[step.color]
                        const isEven = i % 2 === 0
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                className={`grid lg:grid-cols-2 gap-10 items-center ${!isEven ? 'lg:direction-rtl' : ''}`}
                            >
                                {/* Text Side */}
                                <div className={`space-y-6 ${!isEven ? 'lg:order-2' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl ${c.bg} ${c.border} border flex items-center justify-center ${c.text} ${c.glow}`}>
                                            {step.icon}
                                        </div>
                                        <div>
                                            <div className={`text-[10px] font-black uppercase tracking-[0.3em] ${c.text}`}>Step {step.step}</div>
                                            <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-white">{step.title}</h3>
                                        </div>
                                    </div>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${c.text}`}>{step.subtitle}</p>
                                    <p className="text-zinc-400 font-medium leading-relaxed">{step.desc}</p>
                                    {/* Feature chips */}
                                    <div className="flex flex-wrap gap-2">
                                        {step.features.map((f, j) => (
                                            <div key={j} className={`flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full text-[10px] font-bold text-zinc-400 hover:${c.text} transition-colors`}>
                                                <Check className="w-3 h-3 text-emerald-400" />
                                                {f}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Illustration Side */}
                                <div className={`${!isEven ? 'lg:order-1' : ''}`}>
                                    <div className={`bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-[2.5rem] overflow-hidden ${c.glow} relative`}>
                                        <div className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent ${step.color === 'violet' ? 'via-violet-500/20' : step.color === 'blue' ? 'via-blue-500/20' : step.color === 'cyan' ? 'via-cyan-500/20' : 'via-emerald-500/20'} to-transparent`} />
                                        {step.illustration}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Extra Features Grid */}
                <div className="mt-32">
                    <div className="text-center mb-16">
                        <h3 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic">
                            AND <span className="text-violet-400">SO MUCH</span> <span className="text-blue-400">MORE</span>
                        </h3>
                        <p className="text-zinc-500 font-medium mt-3 max-w-lg mx-auto">Every tool you need to dominate your next interview, built into one <span className="text-cyan-400 font-bold">intelligent platform</span>.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                        {EXTRA_FEATURES.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl hover:border-white/15 transition-all group space-y-3"
                            >
                                <div className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center ${f.color} group-hover:scale-110 transition-transform`}>
                                    {f.icon}
                                </div>
                                <h4 className={`text-sm font-black italic tracking-tight uppercase ${f.color}`}>{f.title}</h4>
                                <p className="text-zinc-500 text-xs font-medium leading-relaxed group-hover:text-zinc-400 transition-colors">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
