"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
    Trophy, Target, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp,
    ArrowLeft, Star, TrendingUp, Code2, Zap, Brain, Shield, Timer, LayoutGrid
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
    PieChart, Pie, Cell, Tooltip
} from "recharts"
import Link from "next/link"

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

const METRIC_ICONS: Record<string, any> = {
    technicalAccuracy: Target,
    efficiency: Zap,
    codeQuality: Code2,
    problemSolving: Brain,
    timeManagement: Timer,
    debuggingAbility: Shield,
}
const METRIC_LABELS: Record<string, string> = {
    technicalAccuracy: 'Technical Accuracy',
    efficiency: 'Efficiency',
    codeQuality: 'Code Quality',
    problemSolving: 'Problem Solving',
    timeManagement: 'Time Management',
    debuggingAbility: 'Debugging Ability',
}
const READINESS_COLORS: Record<string, string> = {
    'Beginner': 'from-zinc-500 to-zinc-600',
    'Developing': 'from-blue-500 to-cyan-500',
    'Job Ready': 'from-green-500 to-emerald-500',
    'Interview Ready': 'from-purple-500 to-pink-500',
}
const READINESS_BG: Record<string, string> = {
    'Beginner': 'bg-zinc-500/20 border-zinc-500/30 text-zinc-300',
    'Developing': 'bg-blue-500/20 border-blue-500/30 text-blue-300',
    'Job Ready': 'bg-green-500/20 border-green-500/30 text-green-300',
    'Interview Ready': 'bg-purple-500/20 border-purple-500/30 text-purple-300',
}

function ScoreRing({ score }: { score: number }) {
    const r = 54
    const circ = 2 * Math.PI * r
    const dash = (score / 100) * circ
    const color = score >= 80 ? '#a855f7' : score >= 60 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444'
    return (
        <div className="relative flex items-center justify-center w-32 h-32">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={r} fill="none" stroke="#27272a" strokeWidth="10" />
                <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <div className="text-center z-10">
                <div className="text-3xl font-black" style={{ color }}>{score}</div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase">Score</div>
            </div>
        </div>
    )
}

function QuestionAccordion({ question, index }: { question: any; index: number }) {
    const [open, setOpen] = useState(false)
    const accepted = question.status === 'accepted'
    return (
        <div className={`rounded-2xl border overflow-hidden transition-all ${accepted ? 'border-green-500/20 bg-green-500/5' : question.status === 'skipped' ? 'border-zinc-700/30 bg-zinc-900/30' : 'border-red-500/20 bg-red-500/5'}`}>
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                    {accepted ? <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" /> : question.status === 'skipped' ? <div className="w-5 h-5 rounded-full border-2 border-zinc-600 shrink-0" /> : <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                    <div>
                        <p className="font-bold text-sm">Q{index + 1}: {question.title}</p>
                        <p className="text-xs text-zinc-500">{question.difficulty} • {question.status === 'accepted' ? `Solved in ${Math.floor((question.timeTakenSeconds || 0) / 60)}m ${(question.timeTakenSeconds || 0) % 60}s` : question.status === 'skipped' ? 'Skipped' : 'Incorrect'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${accepted ? 'bg-green-500/10 border-green-500/20 text-green-400' : question.status === 'skipped' ? 'bg-zinc-700/30 border-zinc-700 text-zinc-500' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {question.status === 'accepted' ? 'Accepted' : question.status === 'skipped' ? 'Skipped' : 'Wrong'}
                    </span>
                    {open ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                </div>
            </button>
            {open && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                    {question.submissionResult && (
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 bg-black/20 rounded-xl">
                                <p className="text-lg font-black text-white">{question.submissionResult.testCasesPassed}/{question.submissionResult.totalTestCases}</p>
                                <p className="text-[10px] text-zinc-500">Test Cases</p>
                            </div>
                            <div className="p-2 bg-black/20 rounded-xl">
                                <p className="text-lg font-black text-white">{question.submissionResult.runtime || '—'}ms</p>
                                <p className="text-[10px] text-zinc-500">Runtime</p>
                            </div>
                            <div className="p-2 bg-black/20 rounded-xl">
                                <p className="text-lg font-black text-white">{question.submissionResult.memory ? Math.round(question.submissionResult.memory / 1024) : '—'}MB</p>
                                <p className="text-[10px] text-zinc-500">Memory</p>
                            </div>
                        </div>
                    )}
                    {question.aiCodeFeedback && (
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300">
                            <p className="font-bold mb-1">AI Feedback</p>
                            <p>{question.aiCodeFeedback}</p>
                        </div>
                    )}
                    {question.improvementTips && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-yellow-300">
                            <p className="font-bold mb-1">💡 Improvement Tip</p>
                            <p>{question.improvementTips}</p>
                        </div>
                    )}
                    {!question.aiCodeFeedback && (
                        <p className="text-xs text-zinc-600">Practice more problems in the {question.difficulty} category to improve your performance.</p>
                    )}
                </div>
            )}
        </div>
    )
}

export default function CodingRoundReportPage() {
    const router = useRouter()
    const params = useParams()
    const search = useSearchParams()
    const sessionId = params.sessionId as string
    const offline = search.get('offline') === 'true'

    const [session, setSession] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [aiResult, setAiResult] = useState<any>(null)

    useEffect(() => {
        loadReport()
    }, [sessionId])

    const loadReport = async () => {
        if (offline) {
            // Mock report for offline sessions
            const stored = JSON.parse(localStorage.getItem('coding_round_session') || '{}')
            const mockSession = {
                studentDetails: { name: 'Student', level: 'Intermediate' },
                config: { numQuestions: 3, difficulty: 'Medium', language: 'python' },
                questions: [
                    { title: 'Two Sum', difficulty: 'Easy', status: 'accepted', timeTakenSeconds: 420, submissionResult: { testCasesPassed: 3, totalTestCases: 3, runtime: 12, memory: 3200 } },
                    { title: 'Reverse String', difficulty: 'Easy', status: 'wrong', timeTakenSeconds: 300, submissionResult: { testCasesPassed: 1, totalTestCases: 3 } },
                    { title: 'Valid Parentheses', difficulty: 'Medium', status: 'skipped', timeTakenSeconds: 0 },
                ],
                evaluation: {
                    overallScore: 55,
                    accuracyPercent: 33,
                    questionsSolved: 1,
                    readinessLevel: 'Developing',
                    metrics: { technicalAccuracy: 5, efficiency: 6, codeQuality: 5, problemSolving: 5, timeManagement: 7, debuggingAbility: 4 },
                    aiSummary: JSON.stringify({ summary: 'Good start! You solved 1 out of 3 problems. Focus on edge cases and testing your solutions thoroughly.', tips: ['Practice Two Sum variations', 'Learn string manipulation techniques', 'Study stack-based algorithms'] }),
                },
                status: 'completed',
            }
            setSession(mockSession)
            setLoading(false)
            return
        }

        try {
            const res = await fetch(`${API}/api/coding-round/report/${sessionId}`)
            if (!res.ok) throw new Error()
            const data = await res.json()
            setSession(data)
        } catch {
            setSession(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (session?.evaluation?.aiSummary) {
            try {
                setAiResult(JSON.parse(session.evaluation.aiSummary))
            } catch {
                setAiResult({ summary: session.evaluation.aiSummary, tips: [] })
            }
        }
    }, [session])

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center space-y-3">
                <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-zinc-400 text-sm">Generating your report...</p>
            </div>
        </div>
    )

    if (!session) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-center">
            <div className="space-y-4">
                <p className="text-zinc-400">Report not found.</p>
                <Button onClick={() => router.push('/dashboard')} variant="outline">Back to Dashboard</Button>
            </div>
        </div>
    )

    const ev = session.evaluation
    const radarData = ev?.metrics ? Object.entries(ev.metrics).map(([k, v]) => ({
        metric: METRIC_LABELS[k]?.split(' ')[0] || k,
        value: Number(v)
    })) : []

    const pieData = [
        { name: 'Solved', value: ev?.questionsSolved || 0, color: '#a855f7' },
        { name: 'Remaining', value: (session.questions?.length || 0) - (ev?.questionsSolved || 0), color: '#27272a' },
    ]

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Coding Round Report</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Performance Report</h1>
                        <p className="text-zinc-400 mt-1">{session.studentDetails?.name} • {session.config?.language} • {new Date().toLocaleDateString()}</p>
                    </div>
                    <span className={`self-start px-4 py-2 rounded-full border text-sm font-black uppercase tracking-wider ${READINESS_BG[ev?.readinessLevel] || READINESS_BG['Beginner']}`}>
                        {ev?.readinessLevel || 'Beginner'}
                    </span>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-zinc-900/60 border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center gap-1">
                        <ScoreRing score={ev?.overallScore || 0} />
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Overall Score</p>
                    </Card>
                    <SummaryCard icon={LayoutGrid} label="Solved" value={`${ev?.questionsSolved || 0}/${session.questions?.length || 0}`} color="purple" />
                    <SummaryCard icon={Target} label="Accuracy" value={`${ev?.accuracyPercent || 0}%`} color="green" />
                    <SummaryCard icon={Clock} label="Total Time" value={`${Math.floor((session.totalTimeTakenSeconds || 0) / 60)}m`} color="blue" />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Radar Chart */}
                    <Card className="bg-zinc-900/60 border-white/5 rounded-2xl p-6">
                        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Skill Metrics</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="#333" />
                                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#71717a', fontSize: 11 }} />
                                    <Radar name="Score" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.25} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Metrics list */}
                    <Card className="bg-zinc-900/60 border-white/5 rounded-2xl p-6">
                        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Score Breakdown</h2>
                        <div className="space-y-3">
                            {ev?.metrics && Object.entries(ev.metrics).map(([key, val]) => {
                                const Icon = METRIC_ICONS[key] || Star
                                const score = Number(val)
                                const pct = score * 10
                                return (
                                    <div key={key}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <Icon className="w-3.5 h-3.5 text-purple-400" />
                                                <span className="text-xs font-medium text-zinc-300">{METRIC_LABELS[key]}</span>
                                            </div>
                                            <span className="text-xs font-black text-white">{score}/10</span>
                                        </div>
                                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.3, duration: 0.6 }}
                                                className={`h-full rounded-full ${pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>
                </div>

                {/* AI Summary */}
                {aiResult && (
                    <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Brain className="w-5 h-5 text-purple-400" />
                            <h2 className="text-sm font-bold text-purple-300 uppercase tracking-widest">AI Evaluation Summary</h2>
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed mb-4">{aiResult.summary}</p>
                        {aiResult.tips?.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Improvement Tips</p>
                                {aiResult.tips.map((tip: string, i: number) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                                        <TrendingUp className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                                        {tip}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                )}

                {/* Question Analysis */}
                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-purple-400" />
                        Question-by-Question Analysis
                    </h2>
                    <div className="space-y-3">
                        {session.questions?.map((q: any, i: number) => (
                            <QuestionAccordion key={i} question={q} index={i} />
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
                    <Link href="/dashboard" className="flex-1">
                        <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 gap-2">
                            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
                        </Button>
                    </Link>
                    <Link href="/coding-round/setup" className="flex-1">
                        <Button className="w-full bg-purple-600 hover:bg-purple-500 gap-2">
                            <Trophy className="w-4 h-4" /> Start Another Round
                        </Button>
                    </Link>
                    <Link href="/dashboard/code" className="flex-1">
                        <Button className="w-full bg-blue-600 hover:bg-blue-500 gap-2">
                            <Code2 className="w-4 h-4" /> Practice More
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

function SummaryCard({ icon: Icon, label, value, color }: any) {
    const colors: Record<string, string> = { purple: 'text-purple-400 bg-purple-500/10', green: 'text-green-400 bg-green-500/10', blue: 'text-blue-400 bg-blue-500/10', yellow: 'text-yellow-400 bg-yellow-500/10' }
    return (
        <Card className="bg-zinc-900/60 border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black">{value}</div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
        </Card>
    )
}
