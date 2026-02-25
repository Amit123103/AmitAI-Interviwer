"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
    Settings2, Layers, Cpu, Code2, ChevronRight, Sparkles,
    Zap, BookOpen, Terminal, Loader2, Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Auto']
const LANGUAGES = [
    { id: 'python', label: 'Python', color: 'from-blue-500 to-cyan-500' },
    { id: 'javascript', label: 'JavaScript', color: 'from-yellow-500 to-orange-500' },
    { id: 'java', label: 'Java', color: 'from-red-500 to-orange-500' },
    { id: 'cpp', label: 'C++', color: 'from-purple-500 to-blue-500' },
]
const TOPICS = ['Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Binary Search', 'Hash Maps', 'Recursion', 'Stack/Queue', 'Greedy']

function CodingRoundConfigContent() {
    const router = useRouter()
    const params = useSearchParams()
    const sessionId = params.get('session')

    const [config, setConfig] = useState({
        numQuestions: 5,
        difficulty: 'Auto',
        language: 'python',
        topic: '',
    })
    const [cvData, setCvData] = useState<any>(null)
    const [starting, setStarting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const stored = localStorage.getItem('coding_round_session')
        if (stored) {
            const { cvData: cv } = JSON.parse(stored)
            setCvData(cv)
        }
    }, [])

    const handleStart = async () => {
        if (!sessionId) return
        setStarting(true)
        setError('')

        const stored = JSON.parse(localStorage.getItem('coding_round_session') || '{}')

        if (stored.offline) {
            // Offline mode — skip API
            localStorage.setItem('coding_round_session', JSON.stringify({ ...stored, config }))
            router.push(`/coding-round/session?session=${sessionId}`)
            return
        }

        try {
            const res = await fetch(`${API}/api/coding-round/${sessionId}/configure`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            })
            const data = await res.json()
            if (data.session) {
                localStorage.setItem('coding_round_session', JSON.stringify({ ...stored, config, questions: data.session.questions }))
                router.push(`/coding-round/session?session=${sessionId}`)
            } else {
                setError(data.error || 'Configuration failed')
            }
        } catch {
            localStorage.setItem('coding_round_session', JSON.stringify({ ...stored, config }))
            router.push(`/coding-round/session?session=${sessionId}`)
        } finally {
            setStarting(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
            <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-600/8 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/8 rounded-full blur-[100px] pointer-events-none" />

            <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest mb-4">
                    <Settings2 className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-blue-400">Round Configuration</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Configure Your Round</h1>
                <p className="text-zinc-400 mt-2">Customize your coding challenge parameters.</p>
            </div>

            {/* CV Skills Banner */}
            {cvData?.languages?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-2xl mb-4 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-1">CV Skills Detected</p>
                        <div className="flex flex-wrap gap-1.5">
                            {[...cvData.languages, ...(cvData.frameworks || [])].slice(0, 8).map((s: string) => (
                                <span key={s} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-zinc-300 capitalize">{s}</span>
                            ))}
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-1">Questions will be tailored to your detected experience.</p>
                    </div>
                </motion.div>
            )}

            <Card className="w-full max-w-2xl bg-zinc-900/60 border-white/8 backdrop-blur-xl rounded-3xl">
                <CardContent className="p-6 md:p-8 space-y-8">

                    {/* Number of Questions */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                                Number of Questions
                            </label>
                            <span className="text-2xl font-black text-white">{config.numQuestions}</span>
                        </div>
                        <Slider
                            min={1} max={10} step={1}
                            value={[config.numQuestions]}
                            onValueChange={([v]) => setConfig({ ...config, numQuestions: v })}
                            className="cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-zinc-600 mt-1.5">
                            <span>1 (Quick)</span><span>5 (Standard)</span><span>10 (Full Round)</span>
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div>
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                            <Layers className="w-3.5 h-3.5 text-blue-400" />
                            Difficulty Level
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {DIFFICULTIES.map(d => {
                                const color = d === 'Easy' ? 'green' : d === 'Medium' ? 'yellow' : d === 'Hard' ? 'red' : 'purple'
                                const isActive = config.difficulty === d
                                return (
                                    <button key={d} onClick={() => setConfig({ ...config, difficulty: d })}
                                        className={`h-12 rounded-xl border text-sm font-bold transition-all
                                            ${isActive
                                                ? d === 'Auto' ? 'bg-purple-600/30 border-purple-500 text-purple-300' : `bg-${color}-500/20 border-${color}-500/50 text-${color}-400`
                                                : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'}`}>
                                        {d === 'Auto' ? '✨ Auto' : d}
                                    </button>
                                )
                            })}
                        </div>
                        {config.difficulty === 'Auto' && (
                            <p className="text-xs text-zinc-600 mt-2">AI will pick the best difficulty based on your CV and skill level.</p>
                        )}
                    </div>

                    {/* Language */}
                    <div>
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                            <Terminal className="w-3.5 h-3.5 text-blue-400" />
                            Preferred Language
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {LANGUAGES.map(lang => (
                                <button key={lang.id} onClick={() => setConfig({ ...config, language: lang.id })}
                                    className={`h-12 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2
                                        ${config.language === lang.id
                                            ? 'bg-white/10 border-white/30 text-white shadow-lg'
                                            : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'}`}>
                                    {config.language === lang.id && <Check className="w-3.5 h-3.5" />}
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Topic Preference */}
                    <div>
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                            <Cpu className="w-3.5 h-3.5 text-blue-400" />
                            Topic Preference <span className="text-zinc-700">(optional)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {TOPICS.map(t => (
                                <button key={t} onClick={() => setConfig({ ...config, topic: config.topic === t ? '' : t })}
                                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all
                                        ${config.topic === t
                                            ? 'bg-blue-600/30 border-blue-500/50 text-blue-300'
                                            : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                        {!config.topic && <p className="text-xs text-zinc-700 mt-2">No preference — AI will select the best topics for you.</p>}
                    </div>

                    {error && <p className="text-xs text-red-400 text-center">{error}</p>}

                    {/* Start Button */}
                    <Button onClick={handleStart} disabled={starting}
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-base rounded-2xl shadow-xl shadow-blue-900/30 group">
                        {starting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Zap className="w-5 h-5 mr-2 fill-current" />}
                        {starting ? 'Generating Questions...' : `Start Coding Round`}
                        {!starting && <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
                    </Button>

                    <p className="text-center text-xs text-zinc-600">
                        Questions are AI-selected from our database based on your CV and preferences. Timer starts automatically.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default function CodingRoundConfigPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen bg-black text-white"><Loader2 className="animate-spin w-8 h-8" /></div>}>
            <CodingRoundConfigContent />
        </Suspense>
    )
}
