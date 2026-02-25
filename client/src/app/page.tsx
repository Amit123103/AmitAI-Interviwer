"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Logo from "@/components/ui/Logo"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { Mic, Video, BarChart3, ShieldCheck, ArrowRight, Play, CheckCircle2, Zap, Brain, Sparkles, Trophy, Activity, Globe, Menu, X } from "lucide-react"
import MeshBackground from "./dashboard/components/MeshBackground"
import SystemDemo from "@/components/landing/SystemDemo"
import NeuralArchitecture from "@/components/landing/NeuralArchitecture"
import SuccessWall from "@/components/landing/SuccessWall"
import HowItWorks from "@/components/landing/HowItWorks"

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { scrollY, scrollYProgress } = useScroll()
  const navBackground = useTransform(scrollY, [0, 100], ["rgba(0,0,0,0)", "rgba(9,9,11,0.8)"])
  const navBlur = useTransform(scrollY, [0, 100], ["blur(0px)", "blur(24px)"])
  const scrollLineScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  // Parallax transforms for background elements
  const y1 = useTransform(scrollY, [0, 2000], [0, -200])
  const y2 = useTransform(scrollY, [0, 2000], [0, -500])
  const rotate1 = useTransform(scrollY, [0, 2000], [0, 45])
  const rotate2 = useTransform(scrollY, [0, 2000], [0, -45])

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-primary selection:text-black overflow-x-hidden">
      <MeshBackground />

      {/* Parallax Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          style={{ y: y1, rotate: rotate1 }}
          className="absolute top-[10%] -left-[10%] w-[40vw] h-[40vw] bg-violet-500/[0.06] blur-[120px] rounded-full"
        />
        <motion.div
          style={{ y: y2, rotate: rotate2 }}
          className="absolute top-[40%] -right-[15%] w-[50vw] h-[50vw] bg-blue-500/[0.06] blur-[150px] rounded-full"
        />
        <motion.div
          style={{ y: y1, x: y1 }}
          className="absolute bottom-[10%] left-[20%] w-[30vw] h-[30vw] bg-emerald-500/[0.04] blur-[100px] rounded-full"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute top-[60%] left-[60%] w-[25vw] h-[25vw] bg-rose-500/[0.03] blur-[120px] rounded-full"
        />
      </div>

      {/* Premium Navbar */}
      <motion.header
        style={{ backgroundColor: navBackground, backdropFilter: navBlur }}
        className="px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between border-b border-white/[0.06] fixed w-full z-[100] transition-all"
      >
        <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500 origin-left z-50 w-full" style={{ transform: `scaleX(${scrollYProgress.get()})` }} />

        <Link className="flex items-center gap-3 group" href="/">
          <Logo size={40} showText showStatus />
        </Link>
        <nav className="hidden md:flex gap-1 items-center">
          {[
            { label: "Features", hoverColor: "group-hover:text-violet-400", hoverBg: "hover:bg-violet-500/[0.08]", underline: "bg-violet-400" },
            { label: "Methodology", hoverColor: "group-hover:text-blue-400", hoverBg: "hover:bg-blue-500/[0.08]", underline: "bg-blue-400" },
            { label: "Pricing", hoverColor: "group-hover:text-cyan-400", hoverBg: "hover:bg-cyan-500/[0.08]", underline: "bg-cyan-400" },
            { label: "About", hoverColor: "group-hover:text-emerald-400", hoverBg: "hover:bg-emerald-500/[0.08]", underline: "bg-emerald-400" },
          ].map(({ label, hoverColor, hoverBg, underline }) => (
            <Link key={label} className={`text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ${hoverBg} px-4 py-2 rounded-lg transition-all relative group`} href="#">
              <span className={`${hoverColor} transition-colors`}>{label}</span>
              <span className={`absolute -bottom-0.5 left-3 right-3 h-[2px] ${underline} rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left`} />
            </Link>
          ))}
          <div className="h-5 w-px bg-white/[0.08] mx-3" />
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/[0.06] border border-emerald-500/15 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400/80">Core Online</span>
          </div>
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/auth/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-white/[0.05]">
            Login
          </Link>
          <Link href="/auth/signup" className="hidden sm:block">
            <Button className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:from-violet-500 hover:to-cyan-400 shadow-[0_8px_30px_rgba(139,92,246,0.3)] hover:shadow-[0_12px_40px_rgba(139,92,246,0.4)] h-10 sm:h-11 px-5 sm:px-7 rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] transition-all hover:-translate-y-0.5 active:scale-95 border-0">
              Get Started
            </Button>
          </Link>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[99] bg-black/95 backdrop-blur-2xl pt-20 px-6 flex flex-col gap-6 md:hidden"
          >
            <nav className="flex flex-col gap-2">
              {[
                { label: "Features", hoverClass: "hover:text-violet-400", border: "border-violet-500/20" },
                { label: "Methodology", hoverClass: "hover:text-blue-400", border: "border-blue-500/20" },
                { label: "Pricing", hoverClass: "hover:text-cyan-400", border: "border-cyan-500/20" },
                { label: "About", hoverClass: "hover:text-emerald-400", border: "border-emerald-500/20" },
              ].map(({ label, hoverClass, border }) => (
                <Link key={label} onClick={() => setMobileMenuOpen(false)} className={`text-lg font-black uppercase tracking-[0.2em] text-zinc-400 ${hoverClass} transition-all py-3 border-b ${border}`} href="#">
                  {label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-3 pt-4">
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px]">
                  Login
                </Button>
              </Link>
              <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-auto mb-8">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400/70">AMITAI Core Online</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="w-full min-h-screen flex items-center justify-center pt-20 sm:pt-24 pb-10 sm:pb-16 relative overflow-hidden">
          <div className="container px-4 sm:px-6 mx-auto">
            <div className="flex flex-col items-center text-center space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="space-y-6 max-w-5xl"
              >
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4 backdrop-blur-2xl shadow-[0_0_40px_rgba(139,92,246,0.08)]">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgba(139,92,246,0.9)]" />
                  Now Integrated with AMITAI Interview v2.4
                  <Sparkles className="w-3 h-3 text-primary/60" />
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-[0.9] italic uppercase">
                  MASTER YOUR <br />
                  <span className="gradient-text italic">INTERVIEW</span> <span className="text-zinc-700">FLOW</span>
                </h1>

                <p className="mx-auto max-w-2xl text-zinc-400 text-lg md:text-xl font-medium leading-relaxed tracking-wide">
                  Practice with the world's most advanced <span className="text-violet-400 font-bold">AI interviewer</span>. Real-time <span className="text-blue-400 font-bold">face tracking</span>, <span className="text-emerald-400 font-bold">sentiment analysis</span>, and <span className="text-amber-400 font-bold">technical evaluations</span> that get you hired.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-6 sm:pt-10">
                  <Link href="/auth/signup">
                    <Button size="lg" className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-10 text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl bg-primary text-white hover:bg-white hover:text-black shadow-[0_20px_50px_rgba(var(--primary),0.3)] transition-all hover:-translate-y-2 group">
                      Initial Practice Session
                      <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="#demo">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-10 text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl border-white/10 bg-white/5 hover:bg-white hover:text-black backdrop-blur-3xl transition-all">
                      <Play className="mr-3 w-4 h-4" /> System Demo
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Animated Interview Showcase */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.4 }}
                className="relative w-full max-w-5xl mt-12 group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-blue-500/10 to-cyan-500/10 blur-[140px] rounded-full group-hover:from-primary/25 transition-all duration-1000 animate-pulse" />
                <div className="relative bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] sm:rounded-[3rem] shadow-[0_0_60px_rgba(0,0,0,0.4)] overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  {/* Window Chrome */}
                  <div className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5 sm:gap-2">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/60" />
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/60" />
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/60" />
                      </div>
                      <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hidden sm:block">AI Interview Session — Live</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex items-center gap-1.5"
                      >
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-red-400/80">REC</span>
                      </motion.div>
                      <span className="text-[9px] sm:text-[10px] font-mono font-black text-zinc-500">12:47</span>
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-5">
                    {/* Interview Area */}
                    <div className="lg:col-span-3 p-4 sm:p-6">
                      <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/[0.06] aspect-[16/9]">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                        {/* AI Avatar Center */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative">
                            <motion.div
                              animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute -inset-6 rounded-full bg-violet-500/15 border border-violet-500/10"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.35, 0.15] }}
                              transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
                              className="absolute -inset-10 rounded-full bg-violet-500/10"
                            />
                            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.3)] border-2 border-violet-400/30">
                              <Brain className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
                            </div>
                          </div>
                        </div>

                        {/* AI Status Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-lg rounded-lg px-2.5 py-1.5 border border-white/[0.06]">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">AMITAI v4.0</span>
                        </div>

                        {/* Animated Voice Waveform Bars */}
                        <div className="absolute bottom-3 inset-x-3 flex items-end justify-center gap-[2px] sm:gap-[3px] h-6 sm:h-8">
                          {Array.from({ length: 32 }).map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{ height: [4, Math.random() * 20 + 4, Math.random() * 12 + 3, 4] }}
                              transition={{ duration: 0.6 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.04, ease: "easeInOut" }}
                              className="w-[2px] sm:w-[3px] rounded-full bg-violet-500/60"
                              style={{ minHeight: 3 }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Live Analysis Sidebar */}
                    <div className="lg:col-span-2 p-4 sm:p-5 space-y-4 border-t lg:border-t-0 lg:border-l border-white/[0.06] bg-white/[0.01]">
                      {/* Transcript */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-5 h-5 rounded-md bg-blue-500/15 flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-blue-400" />
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Live <span className="text-blue-400">Transcript</span></span>
                        </div>
                        <div className="space-y-2.5">
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1 }}
                            className="flex gap-2"
                          >
                            <div className="w-6 h-6 rounded-md bg-violet-500/20 flex-shrink-0 flex items-center justify-center border border-violet-500/20">
                              <Brain className="w-3 h-3 text-violet-400" />
                            </div>
                            <div className="px-3 py-2 rounded-xl text-[11px] leading-relaxed bg-white/[0.04] border border-white/[0.06] text-zinc-400">
                              Walk me through your most challenging system design decision...
                            </div>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 2 }}
                            className="flex gap-2 flex-row-reverse"
                          >
                            <div className="w-6 h-6 rounded-md bg-cyan-500/20 flex-shrink-0 flex items-center justify-center border border-cyan-500/20 text-[10px] font-black text-cyan-400">
                              Y
                            </div>
                            <div className="px-3 py-2 rounded-xl text-[11px] leading-relaxed bg-cyan-500/[0.06] border border-cyan-500/[0.08] text-zinc-400">
                              I designed a distributed event-sourcing architecture...
                            </div>
                          </motion.div>
                        </div>
                      </div>

                      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                      {/* Live Metrics */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-5 h-5 rounded-md bg-emerald-500/15 flex items-center justify-center">
                            <BarChart3 className="w-3 h-3 text-emerald-400" />
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Live <span className="text-emerald-400">Analysis</span></span>
                        </div>
                        <div className="space-y-2.5">
                          {[
                            { label: "Confidence", value: 87, color: "from-emerald-500 to-teal-400", text: "text-emerald-400" },
                            { label: "Technical", value: 92, color: "from-violet-500 to-purple-400", text: "text-violet-400" },
                            { label: "Engagement", value: 95, color: "from-amber-500 to-orange-400", text: "text-amber-400" },
                          ].map((m, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between items-baseline">
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">{m.label}</span>
                                <span className={`text-[11px] font-black italic ${m.text}`}>{m.value}%</span>
                              </div>
                              <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${m.value}%` }}
                                  transition={{ duration: 1.5, ease: "easeOut", delay: 1.5 + i * 0.3 }}
                                  className={`h-full bg-gradient-to-r ${m.color} rounded-full`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Status Bar */}
                  <div className="px-4 sm:px-6 py-2.5 border-t border-white/[0.04] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">Neural Core Active</span>
                      </div>
                      <div className="hidden sm:flex items-center gap-2">
                        <Activity className="w-3 h-3 text-violet-400/50" />
                        <span className="text-[8px] font-black uppercase tracking-[0.15em] text-zinc-600">Latency: <span className="text-violet-400">280ms</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[8px] font-black uppercase tracking-[0.15em] text-zinc-600">Q3 of <span className="text-cyan-400">10</span></span>
                      <div className="h-1 w-20 bg-white/[0.04] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "30%" }}
                          transition={{ duration: 2, delay: 2 }}
                          className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* System Demo - Replaces floating UI elements */}
        <SystemDemo />

        {/* How It Works - Step by step guide */}
        <HowItWorks />

        {/* Features Overhaul */}
        <section className="w-full py-20 sm:py-40 relative px-4 sm:px-6">
          <div className="container mx-auto">
            <div className="flex flex-col items-center text-center mb-24 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-2">
                <Sparkles className="w-3 h-3" /> Core Systems
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">The <span className="gradient-text">Preparation</span> <br /> <span className="text-zinc-500">Infrastructure</span></h2>
              <div className="h-1 w-24 bg-gradient-to-r from-primary via-blue-500 to-cyan-500 rounded-full mt-4" />
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={<Mic className="h-8 w-8" />}
                title="NEURAL STT/TTS"
                desc="Proprietary latency-optimized engine for lifelike conversational flow."
                color="primary"
                accentGlow="shadow-[0_0_50px_rgba(139,92,246,0.08)]"
              />
              <FeatureCard
                icon={<Video className="h-8 w-8" />}
                title="VISUAL ATTENTION"
                desc="Real-time gaze tracking and posture analysis to master your presence."
                color="blue"
                accentGlow="shadow-[0_0_50px_rgba(59,130,246,0.08)]"
              />
              <FeatureCard
                icon={<Brain className="h-8 w-8" />}
                title="TECHNICAL BRAIN"
                desc="Deep architectural and algorithmic feedback based on industry standards."
                color="purple"
                accentGlow="shadow-[0_0_50px_rgba(168,85,247,0.08)]"
              />
              <FeatureCard
                icon={<Trophy className="h-8 w-8" />}
                title="ELITE EVALUATION"
                desc="Comprehensive reporting that mirrors top-tier company interview panels."
                color="emerald"
                accentGlow="shadow-[0_0_50px_rgba(16,185,129,0.08)]"
              />
            </div>
          </div>
        </section>

        {/* Neural Architecture Technical Deep-Dive */}
        <NeuralArchitecture />

        {/* Success Wall - Testimonials & Growth */}
        <SuccessWall />

        {/* Trust Section — Vibrant */}
        <section className="w-full py-20 sm:py-40 relative px-4 sm:px-6 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
          <div className="absolute top-[20%] left-0 w-[500px] h-[500px] bg-violet-500/[0.03] blur-[180px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[10%] right-0 w-[400px] h-[400px] bg-blue-500/[0.03] blur-[150px] rounded-full pointer-events-none" />

          <div className="container mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="space-y-10">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">
                  <ShieldCheck className="w-3 h-3" /> Battle-Tested Platform
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">ENGINEERED FOR <br /> <span className="gradient-text">CERTAINTY</span></h2>
                <p className="text-zinc-400 text-lg font-medium leading-relaxed">
                  We've processed over <span className="text-violet-400 font-bold">500,000+</span> mock sessions for candidates entering the world's most competitive <span className="text-blue-400 font-bold">architectural loops</span> at FAANG and beyond.
                </p>
              </div>
              <div className="space-y-5">
                <CheckItem text="93% of users felt more confident after 3 sessions" icon={<Activity className="w-5 h-5" />} color="text-emerald-400" bgColor="bg-emerald-500/10" borderColor="group-hover:bg-emerald-500/20" />
                <CheckItem text="Real-time feedback improves speaking pace by 40%" icon={<Zap className="w-5 h-5" />} color="text-amber-400" bgColor="bg-amber-500/10" borderColor="group-hover:bg-amber-500/20" />
                <CheckItem text="Automated analysis of 12+ critical behavioral traits" icon={<Brain className="w-5 h-5" />} color="text-violet-400" bgColor="bg-violet-500/10" borderColor="group-hover:bg-violet-500/20" />
                <CheckItem text="Advanced anti-cheat with tab detection & voice analysis" icon={<ShieldCheck className="w-5 h-5" />} color="text-rose-400" bgColor="bg-rose-500/10" borderColor="group-hover:bg-rose-500/20" />
                <CheckItem text="Personalized improvement roadmap after every session" icon={<BarChart3 className="w-5 h-5" />} color="text-blue-400" bgColor="bg-blue-500/10" borderColor="group-hover:bg-blue-500/20" />
              </div>
              <Button variant="ghost" className="text-primary p-0 h-auto font-black uppercase tracking-[0.2em] text-[10px] hover:bg-transparent hover:text-white transition-colors group">
                Explore Methodology <ArrowRight className="w-3.5 h-3.5 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-full bg-gradient-to-br from-primary/10 via-blue-500/5 to-cyan-500/5 blur-[120px] pointer-events-none" />
              <div className="relative bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-[1.5rem] sm:rounded-[3rem] p-5 sm:p-10 shadow-[0_0_60px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)] flex flex-col gap-6 sm:gap-8">
                <div className="absolute top-0 inset-x-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent rounded-full" />
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center border border-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                    <Zap className="w-8 h-8 text-violet-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">System Performance</div>
                    <div className="text-2xl font-black italic tracking-tighter"><span className="gradient-text">ULTRA-LOW</span> LATENCY</div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { w: 92, label: "Response Time", color: "from-violet-500 to-purple-500", textColor: "text-violet-400" },
                    { w: 88, label: "Accuracy Score", color: "from-blue-500 to-cyan-500", textColor: "text-blue-400" },
                    { w: 95, label: "Uptime SLA", color: "from-emerald-500 to-teal-500", textColor: "text-emerald-400" },
                  ].map((bar, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">{bar.label}</span>
                        <span className={`text-sm font-black italic ${bar.textColor}`}>{bar.w}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${bar.w}%` }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.2 }}
                          className={`h-full bg-gradient-to-r ${bar.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Mini stats row */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/[0.04]">
                  <div className="text-center">
                    <div className="text-lg font-black italic text-violet-400">280ms</div>
                    <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Avg Latency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black italic text-blue-400">99.9%</div>
                    <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black italic text-emerald-400">512K+</div>
                    <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Sessions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Counter Stats Section */}
        <section className="w-full py-16 sm:py-24 relative px-4 sm:px-6">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { value: "45+", label: "DATA POINTS ANALYZED", sublabel: "Per Second", color: "text-violet-400", borderColor: "border-violet-500/10", glow: "bg-violet-500/[0.03]" },
                { value: "12", label: "EVALUATION DIMENSIONS", sublabel: "Every Answer", color: "text-blue-400", borderColor: "border-blue-500/10", glow: "bg-blue-500/[0.03]" },
                { value: "98.2%", label: "CANDIDATE SATISFACTION", sublabel: "Verified Rating", color: "text-emerald-400", borderColor: "border-emerald-500/10", glow: "bg-emerald-500/[0.03]" },
                { value: "3.5x", label: "FASTER PREPARATION", sublabel: "vs Traditional", color: "text-amber-400", borderColor: "border-amber-500/10", glow: "bg-amber-500/[0.03]" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex flex-col items-center text-center p-5 sm:p-8 ${stat.glow} border ${stat.borderColor} rounded-[1.5rem] sm:rounded-[2rem] space-y-3 hover:border-white/15 transition-all group`}
                >
                  <span className={`text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter ${stat.color}`}>{stat.value}</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 group-hover:text-zinc-300 transition-colors">{stat.label}</span>
                  <span className={`text-[8px] font-bold uppercase tracking-widest ${stat.color} opacity-60`}>{stat.sublabel}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section — Vibrant gradient */}
        <section className="w-full py-20 sm:py-32 relative px-4 sm:px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.04] blur-[200px] rounded-full pointer-events-none" />

          <div className="container mx-auto flex flex-col items-center text-center space-y-8 relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-primary">
              <Sparkles className="w-3 h-3" /> Start For Free
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase italic leading-[0.9]">
              READY TO <span className="gradient-text">DOMINATE</span> <br /> YOUR <span className="text-cyan-400">NEXT</span> <span className="text-emerald-400">INTERVIEW</span><span className="text-amber-400">?</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl font-medium leading-relaxed">
              Join <span className="text-violet-400 font-bold">50,000+</span> engineers who transformed their interview performance. <span className="text-emerald-400 font-bold">No credit card required.</span> Start practicing in under 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 pt-6">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-10 text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl bg-gradient-to-r from-primary to-purple-600 text-white hover:from-primary/90 hover:to-purple-500/90 shadow-[0_20px_60px_rgba(139,92,246,0.3)] transition-all hover:-translate-y-2 group">
                  Start Free Practice
                  <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-10 text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl border-white/10 bg-white/5 hover:bg-white hover:text-black backdrop-blur-3xl transition-all">
                  <Play className="mr-3 w-4 h-4" /> Watch Demo Again
                </Button>
              </Link>
            </div>
            {/* Trust bubbles */}
            <div className="flex items-center gap-6 pt-8">
              <div className="flex -space-x-3">
                {["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"].map((c, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-black flex items-center justify-center text-[8px] font-black text-white`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="space-y-0.5">
                <div className="flex gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-[10px]">★</span>)}
                </div>
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">4.9/5 from <span className="text-white">12,400+</span> reviews</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer — Rich & Colorful */}
      <footer className="border-t border-white/[0.04] bg-zinc-950/80 backdrop-blur-xl relative z-10 px-4 sm:px-6 py-12 sm:py-20">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1 space-y-6">
              <Link className="flex items-center gap-3" href="/">
                <Logo size={36} showText showStatus />
              </Link>
              <p className="text-xs text-zinc-600 leading-relaxed">The world's most advanced AI interview preparation platform. Powered by <span className="text-violet-400">AMITAI</span> neural transformers.</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">All Systems Operational</span>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 italic">Product</h4>
              <div className="flex flex-col gap-3">
                {["AI Interviewer", "System Design", "Code Challenges", "Resume Analysis", "Salary Negotiation"].map(item => (
                  <Link key={item} href="#" className="text-xs text-zinc-500 hover:text-white transition-colors font-medium">{item}</Link>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="space-y-5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 italic">Resources</h4>
              <div className="flex flex-col gap-3">
                {["Documentation", "Question Bank", "Study Roadmap", "Community Forum", "Blog"].map(item => (
                  <Link key={item} href="#" className="text-xs text-zinc-500 hover:text-white transition-colors font-medium">{item}</Link>
                ))}
              </div>
            </div>

            {/* Company */}
            <div className="space-y-5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 italic">Company</h4>
              <div className="flex flex-col gap-3">
                {["About Us", "Careers", "Privacy Policy", "Terms of Service", "Enterprise"].map(item => (
                  <Link key={item} href="#" className="text-xs text-zinc-500 hover:text-white transition-colors font-medium">{item}</Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
              © 2026 AMITAI Interview Platform. Built with <span className="text-rose-400">♥</span> for engineers worldwide.
            </p>
            <div className="flex items-center gap-8">
              {[
                { name: "GitHub", color: "hover:text-white" },
                { name: "Twitter", color: "hover:text-blue-400" },
                { name: "Discord", color: "hover:text-violet-400" },
                { name: "LinkedIn", color: "hover:text-cyan-400" },
              ].map(s => (
                <Link key={s.name} href="#" className={`text-[10px] font-black uppercase tracking-[0.15em] text-zinc-600 ${s.color} transition-colors`}>{s.name}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc, color, accentGlow = '' }: { icon: React.ReactNode, title: string, desc: string, color: string, accentGlow?: string }) {
  const colorMap: any = {
    primary: "group-hover:text-primary group-hover:bg-primary/20 border-primary/20",
    blue: "group-hover:text-blue-500 group-hover:bg-blue-500/20 border-blue-500/20",
    purple: "group-hover:text-purple-500 group-hover:bg-purple-500/20 border-purple-500/20",
    emerald: "group-hover:text-emerald-500 group-hover:bg-emerald-500/20 border-emerald-500/20",
  }

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className={`group relative p-10 bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] hover:border-white/15 rounded-[2.5rem] transition-all duration-500 overflow-hidden ${accentGlow}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10 space-y-6">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-white/[0.04] border border-white/[0.08] transition-all duration-500 ${colorMap[color]}`}>
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className={`text-xl font-black italic tracking-tighter uppercase transition-colors ${color === 'primary' ? 'text-violet-300' :
            color === 'blue' ? 'text-blue-300' :
              color === 'purple' ? 'text-purple-300' :
                'text-emerald-300'
            }`}>{title}</h3>
          <p className="text-zinc-500 leading-relaxed font-medium text-sm group-hover:text-zinc-300 transition-colors">
            {desc}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function CheckItem({ text, icon, color, bgColor, borderColor }: { text: string, icon?: React.ReactNode, color?: string, bgColor?: string, borderColor?: string }) {
  return (
    <motion.div
      whileHover={{ x: 10 }}
      className="flex items-center gap-4 group cursor-default"
    >
      <div className={`${bgColor || 'bg-primary/10'} p-2 rounded-xl ${borderColor || 'group-hover:bg-primary/20'} transition-colors`}>
        {icon || <CheckCircle2 className={`w-5 h-5 ${color || 'text-primary'}`} />}
      </div>
      <span className="text-zinc-400 font-bold tracking-tight text-sm group-hover:text-white transition-all">{text}</span>
    </motion.div>
  )
}
