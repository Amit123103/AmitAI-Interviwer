"use client"

import React, { useEffect, useState, useMemo, useCallback } from "react"
import Logo from "@/components/ui/Logo"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Settings, LogOut, Play, History, Trophy, FileText, TrendingUp, Zap, Target, Code2, Search, Users, Building2, Sparkles, Brain, BookOpen, Award, Terminal, Video, Menu, X } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import TiltCard from "@/components/ui/TiltCard"

const Shimmer = () => <div className="w-full h-full min-h-[100px] animate-pulse bg-white/5 rounded-3xl" />

// Dynamic loading heavy components with skeletons for perceived speed
const MeshBackground = dynamic(() => import("./components/MeshBackground"), { ssr: false })
const HolographicHud = dynamic(() => import("@/components/ui/HolographicHud"), { ssr: false })
const SuccessWall = dynamic(() => import("@/components/SuccessWall"), { ssr: false })
const GamificationPanel = dynamic(() => import("@/components/gamification/GamificationPanel"), { ssr: false, loading: () => <Shimmer /> })
const SarahBriefing = dynamic(() => import("./components/SarahBriefing"), { ssr: false, loading: () => <Shimmer /> })
const ActivityHeatmap = dynamic(() => import("./components/ActivityHeatmap"), { ssr: false, loading: () => <Shimmer /> })
const DailyGoals = dynamic(() => import("./components/DailyGoals"), { ssr: false, loading: () => <Shimmer /> })
const SkillRadar = dynamic(() => import("./components/SkillRadar"), { ssr: false, loading: () => <Shimmer /> })
const ReadinessGauge = dynamic(() => import("./components/ReadinessGauge"), { ssr: false, loading: () => <Shimmer /> })
const StudyTimer = dynamic(() => import("./components/StudyTimer"), { ssr: false, loading: () => <Shimmer /> })
const QuickTips = dynamic(() => import("./components/QuickTips"), { ssr: false, loading: () => <Shimmer /> })
const UpcomingSchedule = dynamic(() => import("./components/UpcomingSchedule"), { ssr: false, loading: () => <Shimmer /> })
const StreakFlame = dynamic(() => import("./components/StreakFlame"), { ssr: false, loading: () => <Shimmer /> })
const CommandPalette = dynamic(() => import("./components/CommandPalette"), { ssr: false })
const LiveStatsBar = dynamic(() => import("./components/LiveStatsBar"), { ssr: false, loading: () => <Shimmer /> })
const InterviewSimPreview = dynamic(() => import("./components/InterviewSimPreview"), { ssr: false, loading: () => <Shimmer /> })
const WeaknessRadar = dynamic(() => import("./components/WeaknessRadar"), { ssr: false, loading: () => <Shimmer /> })
const NotificationCenter = dynamic(() => import("./components/NotificationCenter"), { ssr: false })
const ActivityTimeline = dynamic(() => import("./components/ActivityTimeline"), { ssr: false, loading: () => <Shimmer /> })
const ResourcesVault = dynamic(() => import("./components/ResourcesVault"), { ssr: false, loading: () => <Shimmer /> })

// Recharts optimization with loaders
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false, loading: () => <div className="h-[300px] w-full bg-white/5 animate-pulse rounded-2xl" /> })
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false })
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false })

export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [stats, setStats] = useState<any>(null)
    const [reports, setReports] = useState<any[]>([])
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        const savedUser = localStorage.getItem("user")
        if (!savedUser) {
            router.push("/auth/login")
        } else {
            const userData = JSON.parse(savedUser)
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

            // Parallel Data Fetching
            const fetchData = async () => {
                try {
                    const [gamificationRes, statsRes, reportsRes] = await Promise.all([
                        fetch(`${apiUrl}/api/gamification/sync`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: userData._id, action: 'SYNC' })
                        }),
                        fetch(`${apiUrl}/api/reports/stats/${userData._id}`),
                        fetch(`${apiUrl}/api/reports/user/${userData._id}`)
                    ])

                    const [gamificationData, statsData, reportsData] = await Promise.all([
                        gamificationRes.json().catch(() => ({})),
                        statsRes.json().catch(() => null),
                        reportsRes.json().catch(() => ({ reports: [] }))
                    ])

                    // Sync and update user
                    const updatedUser = { ...userData, ...gamificationData }
                    setUser(updatedUser)
                    localStorage.setItem("user", JSON.stringify(updatedUser))

                    // Update stats and reports
                    if (statsData) setStats(statsData)
                    if (reportsData.reports) {
                        setReports(reportsData.reports.reverse().slice(0, 3))
                    } else if (Array.isArray(reportsData)) {
                        setReports(reportsData.reverse().slice(0, 3))
                    }
                } catch (err) {
                    console.error("Critical dashboard fetch error:", err)
                    setUser(userData) // Fallback to saved user
                }
            }

            fetchData()
        }
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem("user")
        router.push("/auth/login")
    }

    if (!user) return null

    return (
        <div className="flex min-h-screen bg-transparent text-white relative">
            <MeshBackground />
            <HolographicHud />
            <CommandPalette />

            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4">
                <Link href="/dashboard" className="flex items-center">
                    <Logo size={32} showStatus />
                </Link>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white">
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-30 md:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed top-0 left-0 bottom-0 w-[280px] bg-zinc-950/95 backdrop-blur-xl border-r border-white/5 z-40 flex flex-col md:hidden overflow-y-auto custom-scrollbar"
                        >
                            <div className="p-6 pt-8">
                                <Link href="/dashboard" className="flex items-center" onClick={() => setSidebarOpen(false)}>
                                    <Logo size={36} showText showStatus />
                                </Link>
                            </div>
                            <nav className="flex-1 px-4 space-y-1 mt-2">
                                {[
                                    { href: "/dashboard", icon: <User className="w-4 h-4 text-white" />, label: "Dashboard", bg: "bg-gradient-to-br from-indigo-500 to-teal-500", active: true },
                                    { href: "/dashboard/resume", icon: <FileText className="w-4 h-4 text-emerald-400" />, label: "Resume Review", bg: "bg-emerald-500/10" },
                                    { href: "/dashboard/code", icon: <Code2 className="w-4 h-4 text-purple-400" />, label: "Coding Practice", bg: "bg-purple-500/10" },
                                    { href: "/dashboard/technical/details", icon: <Terminal className="w-4 h-4 text-blue-400" />, label: "Technical Round", bg: "bg-blue-500/10" },
                                    { href: "/dashboard/history", icon: <History className="w-4 h-4 text-emerald-400" />, label: "History", bg: "bg-emerald-500/10" },
                                    { href: "/dashboard/onsite", icon: <Building2 className="w-4 h-4 text-amber-400" />, label: "Virtual Onsite", bg: "bg-amber-500/10" },
                                    { href: "/dashboard/leaderboard", icon: <Trophy className="w-4 h-4 text-yellow-400" />, label: "Leaderboard", bg: "bg-yellow-500/10" },
                                    { href: "/dashboard/analytics", icon: <TrendingUp className="w-4 h-4 text-orange-400" />, label: "Analytics", bg: "bg-orange-500/10" },
                                    { href: "/dashboard/resources", icon: <BookOpen className="w-4 h-4 text-emerald-400" />, label: "Learning Library", bg: "bg-emerald-500/10" },
                                    { href: "/dashboard/settings", icon: <Settings className="w-4 h-4 text-zinc-400" />, label: "Settings", bg: "bg-zinc-500/10" },
                                ].map(item => (
                                    <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.active ? 'bg-gradient-to-r from-indigo-500/15 to-teal-500/10 border border-indigo-500/20 text-white font-semibold' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
                                        <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>{item.icon}</div>
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                            <div className="p-4 border-t border-white/5">
                                <Button variant="ghost" className="w-full justify-start gap-3 text-zinc-500 hover:text-white hover:bg-white/5" onClick={() => { handleLogout(); setSidebarOpen(false); }}>
                                    <LogOut className="w-5 h-5" />
                                    <span>Logout</span>
                                </Button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Sidebar - Desktop only */}
            <aside className="w-64 bg-zinc-950/80 backdrop-blur-xl border-r border-white/5 hidden md:flex flex-col sticky top-0 h-screen z-20 overflow-y-auto overflow-x-hidden custom-scrollbar">
                <div className="p-6">
                    <Link href="/dashboard" className="flex items-center group">
                        <Logo size={36} showText showStatus />
                    </Link>
                </div>

                {/* User Profile Card */}
                <div className="mx-4 mb-6 mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-indigo-500/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-200 truncate">{user.username || 'Candidate'}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[10px] text-emerald-400/80">Active</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-zinc-500">Welcome back! Keep up the momentum.</p>
                </div>
                <nav className="flex-1 px-4 space-y-1 mt-6">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500/15 to-teal-500/10 border border-indigo-500/15 text-white font-semibold transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center"><User className="w-4 h-4 text-white" /></div>
                        <span className="text-sm font-semibold text-indigo-300">Dashboard</span>
                    </Link>
                    <Link href="/dashboard/resume" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-zinc-400 hover:text-white group">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/15 transition-all"><FileText className="w-4 h-4 text-emerald-400" /></div>
                        <span className="text-sm font-medium">Resume Review</span>
                    </Link>
                    <Link href="/dashboard/code" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-zinc-400 hover:text-white group">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/15 transition-all"><Code2 className="w-4 h-4 text-purple-400" /></div>
                        <span className="text-sm font-medium">Coding Practice</span>
                    </Link>
                    <Link href="/dashboard/technical/details" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-zinc-400 hover:text-white group">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/15 transition-all"><Terminal className="w-4 h-4 text-blue-400" /></div>
                        <span className="text-sm font-medium">Technical Round</span>
                    </Link>
                    <Link href="/dashboard/history" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-zinc-400 hover:text-white group">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/15 transition-all"><History className="w-4 h-4 text-emerald-400" /></div>
                        <span className="text-sm font-medium">History</span>
                    </Link>
                    <Link href="/dashboard/onsite" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-zinc-400 hover:text-white group">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/15 transition-all"><Building2 className="w-4 h-4 text-amber-400" /></div>
                        <span className="text-sm font-medium">Virtual Onsite</span>
                    </Link>
                    <Link href="/dashboard/leaderboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-zinc-400 hover:text-white group">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/15 transition-all"><Trophy className="w-4 h-4 text-amber-400" /></div>
                        <span className="text-sm font-medium">Leaderboard</span>
                    </Link>
                    <Link href="/dashboard/analytics" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-zinc-400 hover:text-white group">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/15 transition-all"><TrendingUp className="w-4 h-4 text-orange-400" /></div>
                        <span className="text-sm font-medium">Analytics</span>
                    </Link>
                    <Link href="/dashboard/resources" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-zinc-400 hover:text-white group">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500/15 transition-all"><BookOpen className="w-4 h-4 text-teal-400" /></div>
                        <span className="text-sm font-medium">Learning Library</span>
                    </Link>
                    <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-zinc-400 hover:text-white group">
                        <div className="w-8 h-8 rounded-lg bg-zinc-500/10 flex items-center justify-center group-hover:bg-zinc-500/15 transition-all"><Settings className="w-4 h-4 text-zinc-400" /></div>
                        <span className="text-sm font-medium">Settings</span>
                    </Link>
                </nav>
                <div className="p-4 border-t border-white/5 space-y-4">
                    {/* XP Progress Bar */}
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-medium text-zinc-500">Level {user.level || 1}</span>
                            <span className="text-[10px] font-semibold text-indigo-400">{user.xp || 0} / {((user.level || 1) * 500)} XP</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(((user.xp || 0) / ((user.level || 1) * 500)) * 100, 100)}%` }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Award className="w-3 h-3 text-amber-400" />
                            <span className="text-[10px] font-medium text-amber-400/80">{user.rank || 'Rookie'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-3">
                        <NotificationCenter />
                        <div className="h-6 w-[1px] bg-white/10" />
                        <button
                            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                            className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left group/cmd"
                        >
                            <Search className="w-4 h-4 text-zinc-500 group-hover/cmd:text-primary transition-colors" />
                            <span className="text-xs text-zinc-500 flex-1">Quick Search...</span>
                            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-black text-zinc-500">⌘K</kbd>
                        </button>
                    </div>

                    {user.subscriptionStatus !== 'pro' && (
                        <Link href="/pricing">
                            <Card className="bg-gradient-to-br from-indigo-500/10 to-teal-500/5 border-indigo-500/20 p-4 hover:border-indigo-400/30 transition-all group/pro">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4 text-indigo-400" />
                                    <span className="text-xs font-semibold text-indigo-300">Upgrade to Pro</span>
                                </div>
                                <p className="text-xs text-zinc-400 mb-3">Unlock <span className="text-indigo-400 font-medium">unlimited interviews</span> & detailed reports.</p>
                                <Button size="sm" className="w-full bg-gradient-to-r from-indigo-500 to-teal-500 text-white hover:from-indigo-400 hover:to-teal-400 font-semibold text-xs">
                                    Go Pro ✨
                                </Button>
                            </Card>
                        </Link>
                    )}
                    <Button variant="ghost" className="w-full justify-start gap-3 text-zinc-500 hover:text-white hover:bg-white/5" onClick={handleLogout}>
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </Button>
                </div>

                {/* Sidebar footer */}
                <div className="mt-auto border-t border-white/5 px-6 py-3">
                    <p className="text-[10px] text-zinc-600 text-center">AMITAI Interview v2.0</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 pt-14 md:pt-0 aurora-glow">
                <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-10 py-4 sm:py-6 md:py-10 space-y-12 sm:space-y-16 relative">

                    {/* Floating ambient orbs */}
                    <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/5 rounded-full blur-[120px] orb-float pointer-events-none" />
                    <div className="absolute top-[40%] right-10 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] orb-float pointer-events-none" style={{ animationDelay: '2s' }} />
                    <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/4 rounded-full blur-[140px] orb-float pointer-events-none" style={{ animationDelay: '4s' }} />
                    {/* Welcome Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <SarahBriefing user={user} stats={stats} />
                            </div>
                            <div>
                                <ActivityTimeline userId={user._id} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Streak Flame */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.08 }}
                    >
                        <StreakFlame user={user} />
                    </motion.div>

                    {/* ── Section Divider ──────────────── */}
                    <div className="section-divider" />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <GamificationPanel user={user} />
                    </motion.div>

                    {/* Daily Goals Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <DailyGoals />
                    </motion.section>

                    {/* ── Section Divider ──────────────── */}
                    <div className="section-divider" />

                    {/* Live Stats Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                    >
                        <LiveStatsBar stats={stats} user={user} />
                    </motion.div>

                    {/* Readiness, Skills, Focus & Weakness Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <ReadinessGauge />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.35 }}
                        >
                            <SkillRadar />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <StudyTimer />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.45 }}
                        >
                            <WeaknessRadar />
                        </motion.div>
                    </div>

                    {/* ── Section Divider ──────────────── */}
                    <div className="section-divider" />

                    {/* Primary Feature Cards */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-teal-500/20 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">
                                    <span className="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">Quick</span> Actions
                                </h2>
                                <p className="text-xs text-zinc-500">Launch your next session</p>
                            </div>
                            <div className="flex-1 h-[1px] bg-gradient-to-r from-indigo-500/15 to-transparent" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            <Link href="/interview/setup">
                                <TiltCard className="h-full">
                                    <Card className="group relative overflow-hidden rounded-2xl bg-zinc-900/30 backdrop-blur-xl border border-white/[0.06] p-6 hover:bg-white/[0.04] hover:border-indigo-400/25 transition-all duration-500 cursor-pointer h-full hover-shine">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-all duration-500">
                                                    <Play className="w-5 h-5 fill-current" />
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] text-zinc-500">Readiness</div>
                                                    <div className="text-xs font-semibold text-indigo-400">Good</div>
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">Mock Interview</h3>
                                            <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">Practice with <span className="text-indigo-400 font-medium">AI</span> interviewer for behavioral rounds</p>
                                        </div>
                                    </Card>
                                </TiltCard>
                            </Link>

                            <Link href="/dashboard/code">
                                <TiltCard className="h-full">
                                    <Card className="group relative overflow-hidden rounded-2xl bg-zinc-900/30 backdrop-blur-xl border border-white/[0.06] p-6 hover:bg-white/[0.04] hover:border-purple-400/25 transition-all duration-500 cursor-pointer h-full hover-shine">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-all duration-500">
                                                    <Code2 className="w-5 h-5" />
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] text-zinc-500">Progress</div>
                                                    <div className="text-xs font-semibold text-purple-400">Improving</div>
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2"><span className="text-purple-400">Coding</span> Practice</h3>
                                            <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">Master Data Structures & Algorithms with AI hints</p>
                                        </div>
                                    </Card>
                                </TiltCard>
                            </Link>

                            <Link href="/coding-round/setup">
                                <TiltCard className="h-full">
                                    <Card className="group relative overflow-hidden rounded-2xl bg-zinc-900/30 backdrop-blur-xl border border-white/[0.06] p-6 hover:bg-white/[0.04] hover:border-blue-400/25 transition-all duration-500 cursor-pointer h-full hover-shine">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-all duration-500">
                                                    <Terminal className="w-5 h-5" />
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] text-zinc-500">Status</div>
                                                    <div className="text-xs font-semibold text-blue-400">Getting started</div>
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2"><span className="text-blue-400">Coding</span> Round</h3>
                                            <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">AI-proctored coding challenges with CV-personalized questions</p>
                                        </div>
                                    </Card>
                                </TiltCard>
                            </Link>

                            <Link href="/instant-interview">
                                <TiltCard className="h-full">
                                    <Card className="group relative overflow-hidden rounded-2xl bg-zinc-900/30 backdrop-blur-xl border border-white/[0.06] p-6 hover:bg-white/[0.04] hover:border-amber-400/25 transition-all duration-500 cursor-pointer h-full hover-shine">
                                        <span className="absolute top-4 right-4 px-2.5 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-300 rounded-full z-20">
                                            New
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-all duration-500">
                                                    <Video className="w-5 h-5" />
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] text-zinc-500">Status</div>
                                                    <div className="text-xs font-semibold text-amber-400">Available</div>
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2"><span className="text-amber-400">Instant</span> Interview</h3>
                                            <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">Jump straight into a voice interview with our AI</p>
                                        </div>
                                    </Card>
                                </TiltCard>
                            </Link>

                            <Link href="/interview/setup">
                                <Card className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 to-teal-500/[0.06] border border-indigo-500/20 p-6 hover:border-indigo-400/40 hover:-translate-y-1 transition-all duration-500 cursor-pointer h-full">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-[80px] -z-10" />
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-105 transition-all duration-500">
                                            <Zap className="w-5 h-5 fill-current" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2"><span className="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">Start Interview</span> Now</h3>
                                        <p className="text-sm text-zinc-400 mb-6 group-hover:text-zinc-300 transition-colors">Begin your AI-powered interview session</p>
                                        <Button className="w-full bg-gradient-to-r from-indigo-500 to-teal-500 text-white hover:from-indigo-400 hover:to-teal-400 font-semibold rounded-xl h-11 text-sm">
                                            <Play className="w-4 h-4 mr-2 fill-current" />
                                            Start Session
                                        </Button>
                                    </div>
                                </Card>
                            </Link>

                            <Link href="/dashboard/history">
                                <TiltCard className="h-full">
                                    <Card className="group relative overflow-hidden rounded-2xl bg-zinc-900/30 backdrop-blur-xl border border-white/[0.06] p-6 hover:bg-white/[0.04] hover:border-emerald-400/25 transition-all duration-500 cursor-pointer h-full hover-shine">
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-all duration-500">
                                                <History className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2"><span className="text-emerald-400">Interview</span> Reports</h3>
                                            <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">View detailed analysis and feedback from past sessions</p>
                                        </div>
                                    </Card>
                                </TiltCard>
                            </Link>

                            <Link href="/dashboard/analytics">
                                <TiltCard className="h-full">
                                    <Card className="group relative overflow-hidden rounded-2xl bg-zinc-900/30 backdrop-blur-xl border border-white/[0.06] p-6 hover:bg-white/[0.04] hover:border-purple-400/25 transition-all duration-500 cursor-pointer h-full hover-shine">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10">
                                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-all duration-500">
                                                <TrendingUp className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2"><span className="text-purple-400">Progress</span> Tracker</h3>
                                            <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">Track your improvement over time with detailed metrics</p>
                                        </div>
                                    </Card>
                                </TiltCard>
                            </Link>

                            <Link href="/dashboard/analytics">
                                <TiltCard className="h-full">
                                    <Card className="group relative overflow-hidden rounded-2xl bg-zinc-900/30 backdrop-blur-xl border border-white/[0.06] p-6 hover:bg-white/[0.04] hover:border-rose-400/25 transition-all duration-500 cursor-pointer h-full hover-shine">
                                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10">
                                            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-105 transition-all duration-500">
                                                <Target className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2"><span className="text-rose-400">Performance</span> Insights</h3>
                                            <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">AI-powered feedback and personalized recommendations</p>
                                        </div>
                                    </Card>
                                </TiltCard>
                            </Link>
                        </div>
                    </motion.section>

                    {/* ── Section Divider ──────────────── */}
                    <div className="section-divider" />

                    {/* Interview Simulator Preview */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <InterviewSimPreview />
                    </motion.section>

                    {/* ── Section Divider ──────────────── */}
                    <div className="section-divider" />

                    {/* Schedule & Quick Tips Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <UpcomingSchedule />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <QuickTips />
                        </motion.div>
                    </div>


                    {/* New Features Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-teal-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">
                                    <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">New</span> Features
                                </h2>
                                <p className="text-xs text-zinc-500">Explore what's new</p>
                            </div>
                            <div className="flex-1 h-[1px] bg-gradient-to-r from-teal-500/15 to-transparent" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            <Link href="/dashboard/templates">
                                <Card className="group relative overflow-hidden rounded-2xl bg-zinc-900/30 backdrop-blur-xl border border-white/[0.06] p-6 hover:bg-white/[0.04] hover:border-emerald-400/25 hover:-translate-y-1 transition-all duration-500 cursor-pointer h-full hover-shine">
                                    <span className="absolute top-4 right-4 px-2.5 py-0.5 text-[10px] font-semibold bg-teal-500/20 text-teal-300 rounded-full z-20">
                                        New
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-all duration-500">
                                            <Search className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2"><span className="text-emerald-400">Find</span> Templates</h3>
                                        <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">30+ job-role specific interview templates</p>
                                    </div>
                                </Card>
                            </Link>

                            <Link href="/dashboard/practice">
                                <Card className="group relative overflow-hidden rounded-2xl bg-zinc-900/30 backdrop-blur-xl border border-white/[0.06] p-6 hover:bg-white/[0.04] hover:border-pink-400/25 hover:-translate-y-1 transition-all duration-500 cursor-pointer h-full hover-shine">
                                    <span className="absolute top-4 right-4 px-2.5 py-0.5 text-[10px] font-semibold bg-pink-500/20 text-pink-300 rounded-full z-20">
                                        New
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-4 group-hover:scale-105 transition-all duration-500">
                                            <Brain className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2"><span className="text-pink-400">AI Practice</span> Mode</h3>
                                        <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">Adaptive difficulty based on your performance</p>
                                    </div>
                                </Card>
                            </Link>

                            <Link href="/dashboard/questions">
                                <TiltCard className="h-full">
                                    <Card className="group relative overflow-hidden rounded-2xl bg-zinc-900/30 backdrop-blur-xl border border-white/[0.06] p-6 hover:bg-white/[0.04] hover:border-teal-400/25 transition-all duration-500 cursor-pointer h-full">
                                        <span className="absolute top-4 right-4 px-2.5 py-0.5 text-[10px] font-semibold bg-teal-500/20 text-teal-300 rounded-full z-20">
                                            New
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10">
                                            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-105 transition-all duration-500">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2"><span className="text-teal-400">Question</span> Bank</h3>
                                            <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">Browse 1000+ curated interview questions</p>
                                        </div>
                                    </Card>
                                </TiltCard>
                            </Link>

                            <Link href="/dashboard/companies">
                                <Card className="group relative overflow-hidden rounded-2xl bg-zinc-900/30 backdrop-blur-xl border border-white/[0.06] p-6 hover:bg-white/[0.04] hover:border-indigo-400/25 hover:-translate-y-1 transition-all duration-500 cursor-pointer h-full">
                                    <span className="absolute top-4 right-4 px-2.5 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 rounded-full z-20">
                                        New
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-105 transition-all duration-500">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2"><span className="text-indigo-400">Company</span> Prep</h3>
                                        <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">Tailored preparation for FAANG interviews</p>
                                    </div>
                                </Card>
                            </Link>

                            <Link href="/dashboard/flashcards">
                                <TiltCard className="h-full">
                                    <Card className="group relative overflow-hidden rounded-2xl bg-zinc-900/30 backdrop-blur-xl border border-white/[0.06] p-6 hover:bg-white/[0.04] hover:border-amber-400/25 transition-all duration-500 cursor-pointer h-full hover-shine">
                                        <span className="absolute top-4 right-4 px-2.5 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-300 rounded-full z-20">
                                            New
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10">
                                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 transition-all duration-500">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2"><span className="text-amber-400">Interview</span> Flashcards</h3>
                                            <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">Quick-review flashcard decks for common Q&A patterns</p>
                                        </div>
                                    </Card>
                                </TiltCard>
                            </Link>

                            <Link href="/dashboard/feedback">
                                <TiltCard className="h-full">
                                    <Card className="group relative overflow-hidden rounded-2xl bg-zinc-900/30 backdrop-blur-xl border border-white/[0.06] p-6 hover:bg-white/[0.04] hover:border-cyan-400/25 transition-all duration-500 cursor-pointer h-full hover-shine">
                                        <span className="absolute top-4 right-4 px-2.5 py-0.5 text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 rounded-full z-20">
                                            New
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10">
                                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-105 transition-all duration-500">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2"><span className="text-cyan-400">Peer</span> Feedback</h3>
                                            <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">Get feedback from community peers on your interview answers</p>
                                        </div>
                                    </Card>
                                </TiltCard>
                            </Link>
                        </div>
                    </motion.section>

                    {/* Collaboration Section - NEW */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center"><Users className="w-4 h-4 text-indigo-400" /></div>
                            <h2 className="text-2xl font-bold tracking-tight"><span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Connect</span> & Practice Together</h2>
                        </div>
                        <p className="text-zinc-400 text-sm mb-4">
                            Join peer-to-peer rooms for mock interviews, collaborative coding, and system design discussions.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Link href="/dashboard/collaboration/new">
                                <Card className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/[0.06] to-purple-500/[0.04] border border-indigo-500/15 p-8 hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-500 cursor-pointer h-full">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-all duration-500">
                                                <Video className="w-5 h-5" />
                                            </div>
                                            <span className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-[10px] font-semibold">
                                                Host Session
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 text-white">Create Room</h3>
                                        <p className="text-sm text-zinc-400 mb-6 group-hover:text-zinc-300 transition-colors leading-relaxed">
                                            Start a real-time collaborative session with active peer feedback.
                                        </p>
                                        <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl h-11 text-sm">
                                            Go Live
                                        </Button>
                                    </div>
                                </Card>
                            </Link>

                            <Link href="/dashboard/collaboration/join">
                                <Card className="group relative overflow-hidden rounded-2xl bg-zinc-900/30 backdrop-blur-xl border border-white/[0.06] p-8 hover:bg-zinc-900/50 hover:border-white/10 hover:-translate-y-1 transition-all duration-500 cursor-pointer h-full">
                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:scale-105 group-hover:text-white transition-all duration-500">
                                                <Users className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 text-white">Join Peer</h3>
                                        <p className="text-sm text-zinc-400 mb-6 group-hover:text-zinc-300 transition-colors leading-relaxed">
                                            Have an invite ID? Enter it here to join an existing session.
                                        </p>
                                        <Button variant="outline" className="w-full border-zinc-700 bg-transparent hover:bg-white/5 text-zinc-300 rounded-xl h-11 font-semibold text-sm">
                                            Join Now
                                        </Button>
                                    </div>
                                </Card>
                            </Link>
                        </div>
                    </motion.section>


                    {/* Performance & Activity Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="bg-zinc-900/30 backdrop-blur-xl border border-white/[0.06] p-6 space-y-6 rounded-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/15 to-blue-500/15 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-indigo-400" /></div>
                                        <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">Performance</span> <span className="text-zinc-300">&</span> Growth
                                    </h2>
                                    <div className="flex gap-4 text-[10px] text-zinc-500">
                                        <span className="flex items-center gap-2 font-medium text-indigo-400"><div className="w-2 h-2 rounded-full bg-indigo-400" /> Actual</span>
                                        <span className="flex items-center gap-2 font-medium text-zinc-500"><div className="w-2 h-2 rounded-full border border-dashed border-zinc-500" /> Projected</span>
                                    </div>
                                </div>
                                <div className="h-[300px] w-full relative z-10">
                                    {stats ? (
                                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                            <AreaChart data={stats?.progressData || []}>
                                                <defs>
                                                    <linearGradient id="colorTech" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" strokeOpacity={0.3} />
                                                <XAxis dataKey="date" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.95)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', backdropFilter: 'blur(20px)', fontSize: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                                                    itemStyle={{ fontWeight: '600', fontSize: '11px' }}
                                                />
                                                <Area type="monotone" dataKey="technical" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTech)" />
                                                <Area type="monotone" dataKey="communication" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorComm)" />

                                                {/* Predictive Line — deterministic offset to avoid re-renders */}
                                                <Area
                                                    type="monotone"
                                                    dataKey={(d: any) => d.technical + ((d.technical % 5) + 2)}
                                                    stroke="#555"
                                                    strokeWidth={2}
                                                    strokeDasharray="5 5"
                                                    fill="none"
                                                    name="Projected"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-600 animate-pulse">
                                            Loading performance data...
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <ActivityHeatmap data={[]} />
                        </div>

                        <Card className="bg-zinc-900/30 backdrop-blur-xl border border-white/[0.06] p-6 flex flex-col rounded-2xl">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/15 to-orange-500/15 flex items-center justify-center"><Zap className="w-4 h-4 text-amber-400" /></div>
                                <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Smart</span> <span className="text-zinc-300">Insights</span>
                            </h2>
                            <div className="space-y-4 flex-1 overflow-auto pr-2 custom-scrollbar">
                                {stats?.recentFeedback?.length > 0 ? (
                                    stats.recentFeedback.map((tip: string, i: number) => (
                                        <div key={i} className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.04] group hover:border-indigo-500/20 transition-colors">
                                            <p className="text-xs text-zinc-300 leading-relaxed italic">"{tip}"</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-zinc-500 text-sm mt-10">
                                        No sufficient data yet. Complete more interviews to unlock insights.
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Achievements Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="bg-zinc-950/30 backdrop-blur-3xl border border-white/[0.06] p-10 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/[0.03] rounded-full blur-[120px] -z-10" />

                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-bold flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/15 to-amber-500/15 flex items-center justify-center"><Trophy className="w-6 h-6 text-yellow-500" /></div>
                                        <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">Achievements</span>
                                    </h2>
                                    <p className="text-xs text-zinc-500">Milestones you've reached</p>
                                </div>

                                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-4 rounded-xl flex items-center gap-6 min-w-[300px]">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-zinc-400">Next milestone</span>
                                            <span className="text-yellow-500 font-medium">75%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-yellow-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: "75%" }}
                                                transition={{ duration: 2 }}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center text-yellow-500">
                                        <Award className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {user.achievements && user.achievements.length > 0 ? (
                                    user.achievements.slice(0, 4).map((achievement: any) => (
                                        <div key={achievement.id} className="relative group/item aspect-square rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col items-center justify-center p-6 hover:bg-white/[0.06] transition-all duration-500">
                                            <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-4 group-hover/item:scale-105 transition-all duration-500">
                                                <Award className="w-8 h-8" />
                                            </div>
                                            <div className="text-center">
                                                <div className="font-semibold text-sm text-white mb-1">{achievement.name}</div>
                                                <div className="text-[10px] text-zinc-500">{achievement.description}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="relative aspect-square rounded-2xl bg-white/[0.01] border border-dashed border-white/[0.06] flex flex-col items-center justify-center p-6 opacity-40">
                                            <div className="w-14 h-14 rounded-full border border-dashed border-white/15 flex items-center justify-center text-zinc-600 mb-4">
                                                <Trophy className="w-5 h-5 opacity-20" />
                                            </div>
                                            <div className="text-center space-y-2">
                                                <div className="w-20 h-2 bg-white/5 rounded-full mx-auto" />
                                                <div className="w-12 h-1.5 bg-white/5 rounded-full mx-auto" />
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-xs text-zinc-500 rotate-[-15deg]">Keep going</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Recent Sessions */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold flex items-center gap-2"><span className="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">Recent</span> <span className="text-zinc-300">Sessions</span></h2>
                                <Link href="/dashboard/history" className="text-sm text-indigo-400 hover:underline">View All</Link>
                            </div>
                            <div className="grid gap-4">
                                {reports.length === 0 ? (
                                    <Card className="p-12 text-center text-zinc-500 bg-zinc-900/40 border-dashed border-zinc-800 rounded-xl">
                                        No recent interview sessions found.
                                    </Card>
                                ) : (
                                    reports.map(report => (
                                        <Card key={report._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 bg-zinc-900/30 backdrop-blur-xl border border-white/[0.06] hover:border-indigo-500/20 hover:bg-white/[0.03] transition-all duration-500 group rounded-2xl gap-4">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 bg-white/[0.04] rounded-xl flex items-center justify-center group-hover:bg-indigo-500/15 group-hover:text-indigo-400 transition-all duration-500 shrink-0">
                                                    <Target className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <h3 className="font-semibold text-lg text-white group-hover:text-indigo-400 transition-colors">{report.sector || 'General'} Interview</h3>
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/15">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            <span className="text-[10px] text-emerald-400 font-medium">Verified</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-zinc-500">{new Date(report.createdAt).toLocaleDateString()} • {report.persona}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 sm:gap-10">
                                                <div className="text-center">
                                                    <div className="text-xs text-zinc-500 mb-1">Score</div>
                                                    <div className="font-bold text-2xl text-indigo-400">
                                                        {Math.round(((report.scores?.technical || 0) + (report.scores?.communication || 0) + (report.scores?.focus || 0)) / 3)}<span className="text-xs opacity-50 ml-0.5">%</span>
                                                    </div>
                                                </div>
                                                <Link href={`/dashboard/report/${report._id}`}>
                                                    <Button className="bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.06] rounded-xl px-6 font-medium text-sm transition-all">
                                                        View Report
                                                    </Button>
                                                </Link>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </section>
                    </motion.div>
                </div>
            </main>
        </div>
    )
}
