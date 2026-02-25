"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, Volume2, Brain, Activity, Sparkles, MonitorPlay, Mic, MicOff, MessageSquare, BarChart3, Shield, Eye, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"

/* ── Voice Waveform Visualizer ── */
function VoiceWaveform({ active, color = "primary", label }: { active: boolean; color?: string; label: string }) {
    const bars = 24
    const colorMap: Record<string, string> = {
        primary: "bg-violet-500",
        blue: "bg-blue-400",
        emerald: "bg-emerald-400",
        cyan: "bg-cyan-400",
    }
    return (
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-white/10' : 'bg-white/5'} transition-colors`}>
                {active ? <Mic className={`w-4 h-4 ${color === 'primary' ? 'text-violet-400' : `text-${color}-400`}`} /> : <MicOff className="w-4 h-4 text-zinc-600" />}
            </div>
            <div className="flex items-end gap-[2px] h-6">
                {Array.from({ length: bars }).map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            height: active ? [4, Math.random() * 20 + 4, 4] : 4,
                        }}
                        transition={{
                            duration: 0.4 + Math.random() * 0.3,
                            repeat: active ? Infinity : 0,
                            delay: i * 0.03,
                            ease: "easeInOut",
                        }}
                        className={`w-[3px] rounded-full ${active ? colorMap[color] || colorMap.primary : 'bg-zinc-800'} transition-colors`}
                        style={{ minHeight: 4 }}
                    />
                ))}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${active ? 'text-zinc-300' : 'text-zinc-600'}`}>{label}</span>
        </div>
    )
}

/* ── Animated Interview Transcript ── */
const CONVERSATION = [
    { speaker: "amitai", text: "Hi! I'm AMITAI, your AI interviewer today. Let's start with a warm-up. Can you walk me through your most challenging technical project?", delay: 0 },
    { speaker: "user", text: "Sure! I designed a real-time collaboration platform using CRDTs for conflict resolution across distributed nodes...", delay: 3 },
    { speaker: "amitai", text: "Fascinating approach! How did you handle the consistency-availability trade-off in your CRDT implementation?", delay: 7 },
    { speaker: "user", text: "We used operation-based CRDTs with a causal broadcast layer. For strong consistency needs, we fell back to Raft consensus...", delay: 11 },
    { speaker: "amitai", text: "Excellent depth. Your confidence score is rising. Let's move to system design — how would you architect a global CDN?", delay: 16 },
]

function LiveTranscript({ isPlaying, elapsed }: { isPlaying: boolean; elapsed: number }) {
    const visibleMessages = CONVERSATION.filter(m => isPlaying && elapsed >= m.delay)

    return (
        <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2 scrollbar-thin">
            <AnimatePresence>
                {visibleMessages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className={`flex gap-3 ${msg.speaker === 'amitai' ? '' : 'flex-row-reverse'}`}
                    >
                        <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-black ${msg.speaker === 'amitai'
                            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/20'
                            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/20'
                            }`}>
                            {msg.speaker === 'amitai' ? <Brain className="w-3.5 h-3.5" /> : 'Y'}
                        </div>
                        <div className={`px-3.5 py-2.5 rounded-2xl text-[12px] leading-relaxed max-w-[80%] ${msg.speaker === 'amitai'
                            ? 'bg-white/[0.04] border border-white/[0.06] text-zinc-300'
                            : 'bg-cyan-500/[0.06] border border-cyan-500/[0.08] text-zinc-300'
                            }`}>
                            {msg.text}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            {visibleMessages.length === 0 && (
                <div className="text-center text-zinc-700 text-xs italic py-6">Press play to start the demo interview...</div>
            )}
        </div>
    )
}

/* ── Live Metrics Panel ── */
function LiveMetrics({ isPlaying, elapsed }: { isPlaying: boolean; elapsed: number }) {
    const metrics = [
        { label: "Confidence", value: Math.min(88, 45 + elapsed * 3), color: "text-emerald-400", bar: "from-emerald-500 to-teal-400" },
        { label: "Technical", value: Math.min(94, 50 + elapsed * 3.5), color: "text-violet-400", bar: "from-violet-500 to-purple-400" },
        { label: "Communication", value: Math.min(91, 60 + elapsed * 2), color: "text-blue-400", bar: "from-blue-500 to-cyan-400" },
        { label: "Engagement", value: Math.min(96, 55 + elapsed * 3), color: "text-amber-400", bar: "from-amber-500 to-orange-400" },
    ]

    return (
        <div className="space-y-3">
            {metrics.map((m, i) => (
                <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">{m.label}</span>
                        <span className={`text-sm font-black italic ${m.color}`}>{isPlaying ? Math.round(m.value) : '--'}%</span>
                    </div>
                    <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full bg-gradient-to-r ${m.bar} rounded-full`}
                            animate={{ width: isPlaying ? `${m.value}%` : '0%' }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function SystemDemo() {
    const [isPlaying, setIsPlaying] = useState(false)
    const [elapsed, setElapsed] = useState(0)
    const [showTelemetry, setShowTelemetry] = useState(true)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (isPlaying) {
            timerRef.current = setInterval(() => {
                setElapsed(prev => prev + 1)
            }, 1000)
        } else {
            if (timerRef.current) clearInterval(timerRef.current)
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [isPlaying])

    const togglePlay = () => {
        if (!isPlaying) {
            setElapsed(0)
        }
        setIsPlaying(!isPlaying)
    }

    const reset = () => {
        setIsPlaying(false)
        setElapsed(0)
    }

    /* which speaker is "talking" based on elapsed */
    const currentSpeaker = CONVERSATION.reduce((acc: string, m) => elapsed >= m.delay ? m.speaker : acc, '')
    const progress = Math.min((elapsed / 20) * 100, 100)

    return (
        <section id="demo" className="w-full py-32 relative overflow-hidden px-6">
            {/* Background accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-primary/[0.04] to-transparent blur-[150px] rounded-full pointer-events-none" />

            <div className="container mx-auto">
                {/* Section Header */}
                <div className="flex flex-col items-center text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">
                        <MonitorPlay className="w-3 h-3" /> Interactive Demo
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
                        WATCH <span className="gradient-text">AMITAI</span> IN <span className="text-cyan-400">ACTION</span>
                    </h2>
                    <p className="text-zinc-500 max-w-2xl font-medium tracking-tight">
                        Experience a <span className="text-violet-400 font-bold">live simulated interview</span> with real-time voice analysis, sentiment tracking, and adaptive questioning. Press play to see our AI interviewer at work.
                    </p>
                </div>

                {/* Demo Player */}
                <div className="relative max-w-6xl mx-auto group">
                    {/* Atmospheric glow */}
                    <div className="absolute -inset-6 bg-gradient-to-r from-violet-500/5 via-blue-500/5 to-cyan-500/5 blur-3xl rounded-[4rem] group-hover:from-violet-500/10 group-hover:via-blue-500/8 group-hover:to-cyan-500/8 transition-all duration-1000" />

                    {/* Main Frame — glass */}
                    <div className="relative bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]">
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        {/* Top: Window Chrome */}
                        <div className="flex items-center justify-between px-8 py-4 border-b border-white/[0.04]">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-3">AI Interview Session — Live</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <motion.div
                                    animate={isPlaying ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.3 }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="flex items-center gap-2"
                                >
                                    <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-zinc-700'}`} />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">{isPlaying ? 'REC' : 'IDLE'}</span>
                                </motion.div>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="grid lg:grid-cols-3 min-h-[450px]">
                            {/* Left: Interview View (2 cols) */}
                            <div className="lg:col-span-2 p-6 space-y-6 border-r border-white/[0.04]">
                                {/* Video Area — simulated with avatar */}
                                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/[0.06] aspect-[16/9]">
                                    {/* Simulated background */}
                                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                                    {/* Scanline effect */}
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_2px] pointer-events-none opacity-30" />

                                    {/* AMITAI Avatar Area */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="relative">
                                            {/* Pulsing ring */}
                                            <motion.div
                                                animate={isPlaying && currentSpeaker === 'amitai' ? { scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] } : {}}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="absolute -inset-4 rounded-full bg-violet-500/20 border border-violet-500/10"
                                            />
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.3)] border-2 border-violet-400/30">
                                                <Brain className="w-10 h-10 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Play overlay */}
                                    {!isPlaying && elapsed === 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
                                            <Button
                                                onClick={togglePlay}
                                                className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white hover:scale-110 transition-transform shadow-[0_0_60px_rgba(139,92,246,0.4)]"
                                            >
                                                <Play className="w-8 h-8 fill-current" />
                                            </Button>
                                        </div>
                                    )}

                                    {/* Top-left: AI Status */}
                                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-lg rounded-xl px-3 py-2 border border-white/[0.06]">
                                        <Brain className="w-3.5 h-3.5 text-violet-400" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.15em]"><span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">AMITAI</span></span>
                                    </div>

                                    {/* Top-right: Timer */}
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-lg rounded-xl px-3 py-2 border border-white/[0.06]">
                                        <span className="text-[10px] font-mono font-black text-zinc-400">
                                            {String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}
                                        </span>
                                    </div>
                                </div>

                                {/* Voice Waveforms */}
                                <div className="flex items-center justify-between gap-4 px-2">
                                    <VoiceWaveform active={isPlaying && currentSpeaker === 'amitai'} color="primary" label="AMITAI" />
                                    <div className="flex-1 h-px bg-gradient-to-r from-violet-500/20 via-white/[0.04] to-cyan-500/20" />
                                    <VoiceWaveform active={isPlaying && currentSpeaker === 'user'} color="cyan" label="Candidate" />
                                </div>
                            </div>

                            {/* Right: Live Analysis Panel */}
                            <div className="p-6 space-y-6 bg-white/[0.01]">
                                {/* Chat transcript */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Live <span className="text-blue-400">Transcript</span></span>
                                    </div>
                                    <LiveTranscript isPlaying={isPlaying} elapsed={elapsed} />
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                                {/* Real-time Metrics */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Live <span className="text-emerald-400">Metrics</span></span>
                                    </div>
                                    <LiveMetrics isPlaying={isPlaying} elapsed={elapsed} />
                                </div>
                            </div>
                        </div>

                        {/* Bottom: Player Controls */}
                        <div className="p-5 border-t border-white/[0.04] space-y-4">
                            {/* Progress Bar */}
                            <div className="relative group/progress cursor-pointer">
                                <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500 relative rounded-full"
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <button onClick={togglePlay} className="text-zinc-400 hover:text-white transition-colors">
                                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                    </button>
                                    <button onClick={reset} className="text-zinc-500 hover:text-white transition-colors">
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <Volume2 className="w-4 h-4 text-zinc-500" />
                                        <div className="h-1 w-16 bg-white/[0.06] rounded-full">
                                            <div className="h-full w-2/3 bg-gradient-to-r from-violet-500/60 to-blue-400/60 rounded-full" />
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono font-black text-zinc-600 tracking-wider">
                                        {String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')} / 0:20
                                    </span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setShowTelemetry(!showTelemetry)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-[9px] font-black uppercase tracking-[0.15em] ${showTelemetry ? 'bg-violet-500/15 border-violet-500/30 text-violet-400' : 'bg-white/[0.03] border-white/[0.06] text-zinc-500 hover:text-white'}`}
                                    >
                                        <Activity className="w-3.5 h-3.5" />
                                        Telemetry
                                    </button>
                                    <button className="p-1.5 hover:bg-white/[0.04] rounded-lg transition-colors">
                                        <Sparkles className="w-4 h-4 text-violet-400/50 hover:text-violet-400 transition-colors" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats under Demo — colorful */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-24">
                    <StatItem label="AVG. IMPROVEMENT" value="+40%" desc="In Confidence Score" color="text-emerald-400" icon={<BarChart3 className="w-4 h-4" />} />
                    <StatItem label="TOTAL INTERVIEWS" value="512K+" desc="Sessions Processed" color="text-violet-400" icon={<Brain className="w-4 h-4" />} />
                    <StatItem label="HIRE RATE" value="92%" desc="For Power Users" color="text-blue-400" icon={<Shield className="w-4 h-4" />} />
                    <StatItem label="LATENCY" value="280ms" desc="Quantum-Scale Response" color="text-cyan-400" icon={<Cpu className="w-4 h-4" />} />
                </div>
            </div>
        </section>
    )
}

function StatItem({ label, value, desc, color, icon }: { label: string; value: string; desc: string; color: string; icon: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center space-y-3 group"
        >
            <div className={`w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center ${color} mb-1`}>
                {icon}
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">{label}</span>
            <span className={`text-3xl font-black italic tracking-tighter ${color}`}>{value}</span>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tight">{desc}</span>
        </motion.div>
    )
}
