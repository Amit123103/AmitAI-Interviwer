"use client"

import React, { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    Upload, FileText, User, GraduationCap, Building2, Brain,
    ChevronRight, CheckCircle2, Loader2, X, Sparkles, Code2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

export default function CodingRoundSetupPage() {
    const router = useRouter()
    const [step, setStep] = useState<'details' | 'cv'>('details')
    const [form, setForm] = useState({ name: '', course: '', department: '', level: 'Intermediate' })
    const [cvFile, setCvFile] = useState<File | null>(null)
    const [cvText, setCvText] = useState('')
    const [cvData, setCvData] = useState<any>(null)
    const [dragOver, setDragOver] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadDone, setUploadDone] = useState(false)
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState('')

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFileSelect(file)
    }, [])

    const handleFileSelect = async (file: File) => {
        if (!file.name.match(/\.(pdf|doc|docx)$/i)) {
            setError('Please upload a PDF, DOC, or DOCX file')
            return
        }
        setCvFile(file)
        setError('')
        setUploadProgress(0)

        // Upload and parse CV
        setUploading(true)
        const formData = new FormData()
        formData.append('cv', file)

        // Simulate progress
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => Math.min(prev + 15, 85))
        }, 200)

        try {
            const res = await fetch(`${API}/api/coding-round/upload-cv`, {
                method: 'POST',
                body: formData
            })
            clearInterval(progressInterval)
            setUploadProgress(100)

            if (res.ok) {
                const data = await res.json()
                setCvText(data.cvText || '')
                setUploadDone(true)
            } else {
                setError('CV parsing failed. You can continue without it.')
                setUploadDone(true)
            }
        } catch {
            clearInterval(progressInterval)
            setUploadProgress(100)
            setUploadDone(true)
            setError('Could not parse CV (offline mode). Continuing without it.')
        } finally {
            setUploading(false)
        }
    }

    const detailsComplete = form.name && form.course && form.department

    const handleContinue = async () => {
        if (!detailsComplete) return
        if (step === 'details') { setStep('cv'); return }

        // Create the session
        setCreating(true)
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            const res = await fetch(`${API}/api/coding-round/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user._id,
                    studentDetails: { ...form, level: form.level as any },
                    cvText: cvText || undefined,
                })
            })
            const data = await res.json()
            if (data.sessionId) {
                localStorage.setItem('coding_round_session', JSON.stringify({ sessionId: data.sessionId, cvData: data.cvData }))
                router.push(`/coding-round/config?session=${data.sessionId}`)
            } else {
                setError(data.error || 'Failed to create session')
            }
        } catch (e) {
            // Offline fallback – generate a local session ID
            const localId = `local_${Date.now()}`
            localStorage.setItem('coding_round_session', JSON.stringify({ sessionId: localId, cvData: null, offline: true }))
            router.push(`/coding-round/config?session=${localId}`)
        } finally {
            setCreating(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest mb-4">
                    <Code2 className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-purple-400">Coding Round</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                    {step === 'details' ? 'Student Setup' : 'Upload Your CV'}
                </h1>
                <p className="text-zinc-400 mt-2 max-w-md mx-auto">
                    {step === 'details'
                        ? 'Tell us about yourself so we can personalize your coding challenges.'
                        : 'Upload your CV to get AI-generated questions tailored to your skills.'}
                </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
                {['Student Details', 'CV Upload'].map((label, i) => {
                    const isActive = (i === 0 && step === 'details') || (i === 1 && step === 'cv')
                    const isDone = i === 0 && step === 'cv'
                    return (
                        <React.Fragment key={label}>
                            {i > 0 && <div className={`w-12 h-px ${isDone || isActive ? 'bg-purple-500' : 'bg-white/10'}`} />}
                            <div className={`flex items-center gap-2 text-xs font-bold transition-colors ${isActive ? 'text-white' : isDone ? 'text-green-400' : 'text-zinc-600'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border ${isActive ? 'bg-purple-600 border-purple-500 text-white' : isDone ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-zinc-900 border-white/10 text-zinc-600'}`}>
                                    {isDone ? '✓' : i + 1}
                                </div>
                                <span className="hidden sm:block">{label}</span>
                            </div>
                        </React.Fragment>
                    )
                })}
            </div>

            <Card className="w-full max-w-lg bg-zinc-900/60 border-white/8 backdrop-blur-xl rounded-3xl">
                <CardContent className="p-6 md:p-8 space-y-5">
                    <AnimatePresence mode="wait">
                        {step === 'details' ? (
                            <motion.div key="details" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                                <FormField icon={User} label="Full Name" placeholder="e.g. Arjun Sharma">
                                    <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. Arjun Sharma" className="bg-black/40 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-purple-500/50 h-12 rounded-xl" />
                                </FormField>

                                <FormField icon={GraduationCap} label="Course / Degree" placeholder="e.g. B.Tech, MCA">
                                    <Input value={form.course} onChange={e => setForm({ ...form, course: e.target.value })}
                                        placeholder="e.g. B.Tech Computer Science" className="bg-black/40 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-purple-500/50 h-12 rounded-xl" />
                                </FormField>

                                <FormField icon={Building2} label="Department / Branch" placeholder="e.g. CSE, IT, ECE">
                                    <Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                                        placeholder="e.g. Computer Science & Engineering" className="bg-black/40 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-purple-500/50 h-12 rounded-xl" />
                                </FormField>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 block mb-3">
                                        <Brain className="w-3.5 h-3.5 inline mr-1.5 text-purple-400" />
                                        Current Level
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {LEVELS.map(lvl => (
                                            <button key={lvl} onClick={() => setForm({ ...form, level: lvl })}
                                                className={`h-12 rounded-xl border text-sm font-bold transition-all
                                                    ${form.level === lvl
                                                        ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]'
                                                        : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'}`}>
                                                {lvl}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="cv" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                {/* Upload Zone */}
                                <div
                                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    onClick={() => { if (!uploadDone) document.getElementById('cv-input')?.click() }}
                                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
                                        ${uploadDone ? 'border-green-500/40 bg-green-500/5' : dragOver ? 'border-purple-500/60 bg-purple-500/10' : 'border-white/10 bg-black/30 hover:border-white/20 hover:bg-white/5'}`}>
                                    <input id="cv-input" type="file" accept=".pdf,.doc,.docx" className="hidden"
                                        onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />

                                    {uploading ? (
                                        <div className="space-y-3">
                                            <Loader2 className="w-10 h-10 text-purple-400 mx-auto animate-spin" />
                                            <p className="text-sm text-zinc-400">Parsing CV with AI...</p>
                                            <div className="w-full bg-zinc-800 rounded-full h-1.5">
                                                <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                            </div>
                                        </div>
                                    ) : uploadDone ? (
                                        <div className="space-y-2">
                                            <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto" />
                                            <p className="text-sm font-bold text-green-400">CV Analyzed Successfully!</p>
                                            <p className="text-xs text-zinc-500">{cvFile?.name}</p>
                                            <button onClick={e => { e.stopPropagation(); setCvFile(null); setCvText(''); setUploadDone(false); setUploadProgress(0) }}
                                                className="mt-2 text-xs text-zinc-500 hover:text-white flex items-center gap-1 mx-auto">
                                                <X className="w-3 h-3" /> Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10">
                                                <Upload className="w-6 h-6 text-zinc-400" />
                                            </div>
                                            <p className="text-sm font-bold">Drop your CV here</p>
                                            <p className="text-xs text-zinc-500">PDF, DOC, DOCX · Max 10MB</p>
                                        </div>
                                    )}
                                </div>

                                {/* CV Skills preview */}
                                {cvText && (
                                    <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">AI Detected Skills</span>
                                        </div>
                                        <p className="text-xs text-zinc-400">Your CV has been analyzed. Personalized questions will be generated based on your skills and experience.</p>
                                    </div>
                                )}

                                <p className="text-center text-xs text-zinc-600">
                                    CV upload is optional but strongly recommended for personalized questions.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && <p className="text-xs text-red-400 text-center">{error}</p>}

                    <Button
                        onClick={handleContinue}
                        disabled={!detailsComplete || creating}
                        className="w-full h-13 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-purple-900/30 group"
                    >
                        {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {step === 'details' ? 'Continue to CV Upload' : 'Analyze & Start Setup'}
                        {!creating && <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                    </Button>

                    {step === 'cv' && (
                        <button onClick={handleContinue} className="w-full text-center text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                            Skip CV Upload → Continue without personalization
                        </button>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function FormField({ icon: Icon, label, placeholder, children }: any) {
    return (
        <div>
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 block mb-2">
                <Icon className="w-3.5 h-3.5 inline mr-1.5 text-purple-400" />
                {label}
            </label>
            {children}
        </div>
    )
}
