"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar, CheckCircle2, Circle, ArrowRight, Loader2, Target, Briefcase, Brain, Trophy, Sparkles, Zap, BookOpen } from "lucide-react"
import Link from "next/link"
import axios from "axios"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import MeshBackground from "../components/MeshBackground"
import HolographicHud from "@/components/ui/HolographicHud"
import TiltCard from "@/components/ui/TiltCard"
import { motion } from "framer-motion"

export default function RoadmapPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [roadmap, setRoadmap] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                const userStr = localStorage.getItem("user")
                if (!userStr) {
                    router.push("/auth/login")
                    return
                }
                const { token } = JSON.parse(userStr)

                const profileRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                const profile = profileRes.data
                if (!profile?.resumeText) {
                    setError("Please upload your resume in the Dashboard first to generate a roadmap.")
                    setLoading(false)
                    return
                }

                const analyticsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/analytics/skills`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                const roadmapRes = await axios.post(`http://localhost:8000/generate-roadmap`, {
                    resume_text: profile.resumeText,
                    target_company: profile.dreamCompany || "General",
                    target_role: profile.department || "Software Engineer",
                    performance_data: analyticsRes.data
                })

                setRoadmap(roadmapRes.data)
            } catch (err) {
                console.error("Failed to fetch roadmap:", err)
                setError("Failed to generate your roadmap. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        fetchRoadmap()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center space-y-6 aurora-glow relative overflow-hidden">
                <div className="absolute top-20 left-10 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
                <div className="absolute bottom-32 right-16 w-72 h-72 bg-fuchsia-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-6 relative z-10"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-2xl flex items-center justify-center border border-violet-500/20 shadow-[0_0_40px_rgba(139,92,246,0.15)]">
                        <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-lg font-black uppercase tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Generating Roadmap</h2>
                        <p className="text-zinc-500 text-xs font-medium animate-pulse">AI is analyzing your profile and building your career path...</p>
                    </div>
                    {/* Progress dots */}
                    <div className="flex gap-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                        ))}
                    </div>
                </motion.div>
            </div>
        )
    }

    if (error || !roadmap) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center aurora-glow relative overflow-hidden">
                <div className="absolute top-20 left-10 w-80 h-80 bg-red-500/3 rounded-full blur-[140px] pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900/40 backdrop-blur-2xl border border-red-500/15 p-10 rounded-2xl max-w-md relative z-10"
                >
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                        <Brain className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-xl font-black mb-2 text-red-300">Roadmap Error</h2>
                    <p className="text-zinc-500 mb-6 text-sm">{error || "No roadmap found."}</p>
                    <Button
                        onClick={() => router.push('/dashboard')}
                        className="bg-gradient-to-r from-red-600 to-rose-600 text-white border-0 shadow-[0_0_20px_rgba(239,68,68,0.2)] font-black uppercase tracking-widest text-[10px]"
                    >
                        Back to Dashboard
                    </Button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-transparent text-white p-4 sm:p-6 md:p-10 lg:p-12 relative overflow-hidden aurora-glow">
            <MeshBackground />
            <HolographicHud />

            {/* Floating ambient orbs */}
            <div className="absolute top-20 left-12 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
            <div className="absolute bottom-32 right-16 w-72 h-72 bg-cyan-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
            <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-fuchsia-500/3 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '6s' }} />

            <div className="max-w-6xl mx-auto space-y-8 relative z-10 transition-all duration-700">
                <DashboardHeader
                    title="Your Interview Roadmap"
                    subtitle={`Personalized career guide based on your target goal: ${roadmap.target_company || "General"}`}
                    icon={<Target className="w-8 h-8 text-violet-400" />}
                    breadcrumbs={[{ label: "Roadmap" }]}
                />

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl text-zinc-400 text-base sm:text-lg leading-relaxed"
                >
                    {roadmap.summary}
                </motion.div>

                {/* Focus Areas with glow */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
                    {roadmap.focus_areas?.map((area: string, i: number) => (
                        <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.08 }}
                            className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 px-4 py-1.5 rounded-full text-xs font-bold text-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.08)] hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] hover:border-violet-500/30 transition-all cursor-default"
                        >
                            {area}
                        </motion.span>
                    ))}
                </div>

                {/* Timeline */}
                <div className="relative">
                    {/* Timeline Line — gradient with glow */}
                    <div className="absolute left-[23px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-violet-500 via-fuchsia-500/20 to-transparent shadow-[0_0_8px_rgba(139,92,246,0.2)]" />

                    <div className="space-y-10">
                        {roadmap.milestones?.map((m: any, i: number) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="relative pl-16 group"
                            >
                                {/* Circle Marker with glow */}
                                <div className={`absolute left-0 top-1.5 w-12 h-12 bg-[#050505] border-2 ${m.is_gated
                                    ? 'border-fuchsia-500 shadow-[0_0_25px_rgba(217,70,239,0.35)]'
                                    : 'border-violet-500 shadow-[0_0_25px_rgba(139,92,246,0.3)]'
                                    } rounded-full flex items-center justify-center z-10 group-hover:scale-110 transition-all duration-500`}>
                                    <span className={`${m.is_gated ? 'text-fuchsia-400' : 'text-violet-400'} font-black text-sm relative z-10`}>{m.day}</span>
                                </div>

                                <TiltCard>
                                    <Card className={`bg-zinc-900/40 backdrop-blur-2xl border border-white/[0.06] ${m.is_gated
                                        ? 'hover:border-fuchsia-500/30 hover:shadow-[0_0_35px_rgba(217,70,239,0.07)]'
                                        : 'hover:border-violet-500/20 hover:shadow-[0_0_30px_rgba(139,92,246,0.06)]'
                                        } transition-all duration-500 overflow-hidden shadow-2xl group/card hover-shine rounded-2xl`}>
                                        {/* Gradient top line */}
                                        <div className={`h-[1px] ${m.is_gated
                                            ? 'bg-gradient-to-r from-transparent via-fuchsia-500/30 to-transparent'
                                            : 'bg-gradient-to-r from-transparent via-violet-500/20 to-transparent'
                                            }`} />

                                        <CardContent className="p-0 flex flex-col md:flex-row">
                                            <div className="p-6 flex-1 space-y-3 text-white">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 ${m.is_gated
                                                        ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20'
                                                        : 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                                                        } rounded-md border`}>
                                                        {m.is_gated ? "MILESTONE GATE" : "PRACTICE SESSION"}
                                                    </span>
                                                    <div className="text-right">
                                                        <div className="text-[7px] font-black uppercase tracking-[0.15em] text-zinc-700">Success Probability</div>
                                                        <div className={`text-[10px] font-black ${m.is_gated ? 'text-fuchsia-400' : 'text-violet-400'}`}>
                                                            {85 + (i * 2)}% NEURAL SYNC
                                                        </div>
                                                    </div>
                                                </div>
                                                <h3 className="text-xl font-bold tracking-tight">{m.title}</h3>
                                                <p className="text-zinc-500 text-sm leading-relaxed">{m.description}</p>

                                                {m.resource && (
                                                    <div className="mt-4 p-3 bg-white/[0.02] rounded-xl border border-white/[0.05] flex items-center justify-between group/res hover:border-violet-500/15 transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center border border-violet-500/10 group-hover/res:shadow-[0_0_10px_rgba(139,92,246,0.1)] transition-all">
                                                                <BookOpen className="w-4 h-4 text-violet-400" />
                                                            </div>
                                                            <span className="text-xs text-zinc-400">{m.resource}</span>
                                                        </div>
                                                        <Link href={`https://www.youtube.com/results?search_query=${encodeURIComponent(m.resource)}`} target="_blank">
                                                            <Button variant="ghost" size="sm" className="h-7 text-[9px] uppercase font-black tracking-widest text-violet-400 hover:bg-violet-500/10 rounded-lg">
                                                                Explore
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-6 bg-white/[0.02] border-t md:border-t-0 md:border-l border-white/[0.06] flex flex-col justify-center items-center gap-4 w-full md:w-56 shrink-0 relative overflow-hidden group/cta">
                                                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover/cta:opacity-100 transition-opacity" />
                                                <Button
                                                    className={`w-full gap-2 font-black rounded-xl h-11 uppercase tracking-widest text-[9px] relative z-10 border-0 ${m.is_gated
                                                        ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-[0_0_20px_rgba(217,70,239,0.25)] hover:shadow-[0_0_30px_rgba(217,70,239,0.4)]'
                                                        : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_30px_rgba(139,92,246,0.35)]'
                                                        } hover:scale-[1.03] transition-all`}
                                                    onClick={() => router.push(`/interview/setup?role=${m.title}`)}
                                                >
                                                    {m.is_gated ? 'Start Mock Interview' : 'Practice Now'} <ArrowRight className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TiltCard>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Footer CTA */}
                <motion.footer
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="mt-20 p-10 bg-zinc-900/40 backdrop-blur-2xl border border-white/[0.06] rounded-2xl text-center space-y-6 hover:border-violet-500/15 transition-all duration-300 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 rounded-2xl flex items-center justify-center mx-auto border border-violet-500/15 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                        <Trophy className="w-8 h-8 text-violet-400" />
                    </div>
                    <h2 className="text-3xl font-black uppercase bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Ready to dominate?</h2>
                    <p className="text-zinc-500 max-w-xl mx-auto">
                        Complete your roadmap to earn the <span className="text-white font-bold">Prepared Pro</span> badge and increase your placement odds by 85%.
                    </p>
                    <Button
                        size="lg"
                        className="rounded-full px-10 font-black h-14 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 text-white shadow-[0_0_25px_rgba(139,92,246,0.2)] hover:shadow-[0_0_45px_rgba(139,92,246,0.4)] hover:scale-[1.03] transition-all duration-500 border-0 uppercase tracking-widest text-[10px]"
                        onClick={() => router.push('/dashboard')}
                    >
                        <Sparkles className="w-4 h-4 mr-2" /> Dashboard Overview
                    </Button>
                </motion.footer>
            </div>
        </div>
    )
}
