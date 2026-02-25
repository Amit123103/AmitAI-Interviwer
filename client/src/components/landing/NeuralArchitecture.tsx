"use client"

import React from "react"
import { motion } from "framer-motion"
import { Cpu, Database, Network, Eye, Layers, Zap, Hexagon, ShieldAlert, FileText, Target, Brain, Sparkles } from "lucide-react"

export default function NeuralArchitecture() {
    return (
        <section className="w-full py-40 relative px-6 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            {/* Background accent glows */}
            <div className="absolute top-[20%] right-0 w-[400px] h-[400px] bg-primary/[0.03] blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[10%] left-0 w-[300px] h-[300px] bg-blue-500/[0.03] blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto">
                <div className="grid lg:grid-cols-2 gap-24 items-start">

                    {/* Left: Technical Narrative */}
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full">
                                <Hexagon className="w-4 h-4 text-violet-400 animate-spin-slow" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-violet-400">Engine Specification v2.4</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase italic leading-[0.9]">
                                <span className="gradient-text">NEURAL</span> <br /> <span className="text-zinc-500">INTELLIGENCE</span> <br /> <span className="text-blue-400">ARCHITECTURE</span>
                            </h2>
                            <p className="text-lg text-zinc-500 font-medium leading-relaxed max-w-xl">
                                AMITAI Interview is built on a distributed transformer architecture, optimized for <span className="text-violet-400 font-bold">sub-300ms latency</span>. We combine real-time biometric telemetry with deep architectural reasoning to evaluate candidate performance across <span className="text-cyan-400 font-bold">12 critical dimensions</span>.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8">
                            <TechFeature
                                icon={<Network className="w-5 h-5" />}
                                title="RAG PIPELINE"
                                desc="Dynamically parses CVs and JDs into structured neural embeddings for context-aware questioning."
                                accentColor="text-violet-400"
                                borderColor="group-hover:border-violet-500/30"
                                bgColor="group-hover:bg-violet-500/10"
                            />
                            <TechFeature
                                icon={<Eye className="w-5 h-5" />}
                                title="ATTENTION GRID"
                                desc="High-frequency pupil and gaze analysis to detect confidence shifts during complex technical answers."
                                accentColor="text-blue-400"
                                borderColor="group-hover:border-blue-500/30"
                                bgColor="group-hover:bg-blue-500/10"
                            />
                            <TechFeature
                                icon={<Database className="w-5 h-5" />}
                                title="KNOWLEDGE INDEX"
                                desc="A massive repository of system design patterns and algorithmic trade-offs indexed for instant retrieval."
                                accentColor="text-cyan-400"
                                borderColor="group-hover:border-cyan-500/30"
                                bgColor="group-hover:bg-cyan-500/10"
                            />
                            <TechFeature
                                icon={<ShieldAlert className="w-5 h-5" />}
                                title="ANTI-COGNITIVE DRIFT"
                                desc="Advanced detection of tab switching, external aids, and speaking pace anomalies."
                                accentColor="text-rose-400"
                                borderColor="group-hover:border-rose-500/30"
                                bgColor="group-hover:bg-rose-500/10"
                            />
                        </div>
                    </div>

                    {/* Right: Metric Grid */}
                    <div className="relative">
                        <div className="absolute -inset-10 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

                        <div className="relative grid grid-cols-2 gap-4">
                            <MetricCard title="Technical Depth" score={94} icon={<Cpu />} barColor="from-violet-500 to-purple-500" valueColor="text-violet-400" />
                            <MetricCard title="System Design" score={88} icon={<Layers />} barColor="from-blue-500 to-cyan-500" valueColor="text-blue-400" />
                            <MetricCard title="Communication" score={91} icon={<Zap />} barColor="from-emerald-500 to-teal-500" valueColor="text-emerald-400" />
                            <MetricCard title="Confidence" score={85} icon={<Target />} barColor="from-amber-500 to-orange-500" valueColor="text-amber-400" />

                            {/* RAG Visualization */}
                            <div className="col-span-2 mt-4 p-8 bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-[2.5rem] shadow-[0_0_60px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)] space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic px-2 flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-violet-400" />
                                        Knowledge Synchronization
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(139,92,246,0.5)]" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-8 py-4">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-white/[0.04] border border-white/[0.08] rounded-xl flex items-center justify-center text-blue-400">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-blue-400/60">Resume.pdf</span>
                                    </div>
                                    <motion.div
                                        className="h-px flex-1 bg-gradient-to-r from-blue-500/20 via-violet-500 to-violet-500/20"
                                        animate={{ opacity: [0.2, 1, 0.2] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-full flex items-center justify-center text-violet-400 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                                            <Brain className="w-7 h-7" />
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-violet-400 italic">AMITAI Neural Core</span>
                                    </div>
                                    <motion.div
                                        className="h-px flex-1 bg-gradient-to-r from-violet-500/20 via-emerald-500 to-emerald-500/20"
                                        animate={{ opacity: [0.2, 1, 0.2] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                                    />
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-white/[0.04] border border-white/[0.08] rounded-xl flex items-center justify-center text-emerald-400">
                                            <Target className="w-5 h-5" />
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400/60">Adaptive Question</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

function TechFeature({ icon, title, desc, accentColor, borderColor, bgColor }: { icon: React.ReactNode, title: string, desc: string, accentColor: string, borderColor: string, bgColor: string }) {
    return (
        <div className="space-y-3 group">
            <div className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center transition-all duration-500 ${borderColor} ${bgColor} ${accentColor}`}>
                {icon}
            </div>
            <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] italic transition-colors ${accentColor}`}>{title}</h4>
            <p className="text-[13px] text-zinc-500 font-medium leading-relaxed group-hover:text-zinc-400 transition-colors">
                {desc}
            </p>
        </div>
    )
}

function MetricCard({ title, score, icon, barColor, valueColor }: { title: string, score: number, icon: React.ReactNode, barColor: string, valueColor: string }) {
    return (
        <div className="p-8 bg-white/[0.02] backdrop-blur-3xl border border-white/[0.06] rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.2)] hover:border-white/15 transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl transition-colors ${valueColor}`}>
                    {icon}
                </div>
                <div className={`text-2xl font-black italic tracking-tighter ${valueColor}`}>{score}%</div>
            </div>
            <div className="space-y-3">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 group-hover:text-zinc-300 transition-colors italic">{title}</div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${score}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r ${barColor}`}
                    />
                </div>
            </div>
        </div>
    )
}
