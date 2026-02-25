"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, MicOff, AlertCircle, Play, Send, Brain, Timer, Shield, Trophy } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { socket } from "@/lib/socket"
import CodeSandbox from "@/components/CodeSandbox"
import RealTimeScript from "@/components/RealTimeScript"

export default function CodingInterviewPage() {
    const router = useRouter()
    const [isRecording, setIsRecording] = useState(false)
    const [currentCode, setCurrentCode] = useState("")
    const [codeOutput, setCodeOutput] = useState<{ stdout?: string, stderr?: string, error?: string }>({})
    const [isRunning, setIsRunning] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [chat, setChat] = useState<{ role: 'ai' | 'user', text: string }[]>([])
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(1)
    const [timeLeft, setTimeLeft] = useState(3600) // 60 minutes
    const [violations, setViolations] = useState<string[]>([])
    const [warning, setWarning] = useState<string | null>(null)
    const [isInterviewOver, setIsInterviewOver] = useState(false)
    const [studentInfo, setStudentInfo] = useState<any>(null)
    const [setupInfo, setSetupInfo] = useState<any>(null)
    const [startTime, setStartTime] = useState<number>(0)
    const [difficultyScore, setDifficultyScore] = useState<number>(0.5)
    const [currentLevel, setCurrentLevel] = useState<string>("Intermediate")

    // Mobile panel management
    const [activePanel, setActivePanel] = useState<'code' | 'chat' | 'output'>('code')

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])

    const logViolation = (type: string) => {
        setViolations(prev => [...prev, type])
        setWarning(type)
        setTimeout(() => setWarning(null), 3000)
        socket.emit("technical-violation", { type, timestamp: Date.now() })
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data)
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
                socket.emit('technical-audio-answer', {
                    audio: blob,
                    currentCode: currentCode,
                    previousQuestion: chat.filter(m => m.role === 'ai').slice(-1)[0]?.text || ""
                })
                audioChunksRef.current = []
            }

            mediaRecorder.start()
            setIsRecording(true)
        } catch (err) {
            console.error("Audio access failed:", err)
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    const finishInterview = (reportId?: string) => {
        setIsInterviewOver(true)
        setTimeout(() => {
            router.push(`/dashboard/report/${reportId || 'latest'}`)
        }, 2000)
    }

    // 1. Setup & Monitoring
    useEffect(() => {
        const details = localStorage.getItem("technical_details")
        const setup = localStorage.getItem("technical_setup")
        if (!details || !setup) {
            router.push("/dashboard/technical/details")
            return
        }
        setStudentInfo(JSON.parse(details))
        setSetupInfo(JSON.parse(setup))

        // Start Anti-cheating listeners
        const handleVisibility = () => {
            if (document.hidden) {
                logViolation("Tab Switch Detected")
            }
        }

        const handleBlur = () => {
            logViolation("Window Unfocused")
        }

        const handlePaste = (e: ClipboardEvent) => {
            e.preventDefault()
            logViolation("Paste Attempt Blocked")
        }

        const handlePrintScreen = (e: KeyboardEvent) => {
            if (e.key === "PrintScreen") {
                logViolation("Screenshot Attempt")
            }
        }

        document.addEventListener("visibilitychange", handleVisibility)
        window.addEventListener("blur", handleBlur)
        document.addEventListener("paste", handlePaste)
        document.addEventListener("keydown", handlePrintScreen)

        // Initialize Audio
        startRecording()

        // 3. START TECHNICAL INTERVIEW
        const startInterview = () => {
            const userId = localStorage.getItem("userId") || "anonymous"
            socket.emit("technical-start", {
                userId,
                codingLevel: JSON.parse(details).level || "Intermediate",
                department: JSON.parse(details).department || "General"
            })
            setStartTime(Date.now())
        }

        startInterview()

        return () => {
            document.removeEventListener("visibilitychange", handleVisibility)
            window.removeEventListener("blur", handleBlur)
            document.removeEventListener("paste", handlePaste)
            document.removeEventListener("keydown", handlePrintScreen)
        }
    }, [])

    // 2. Interview Logic
    useEffect(() => {
        socket.on('ai-response', (data: any) => {
            setChat(prev => [...prev, { role: 'ai', text: data.text }])
            // If the AI response contains code, populate it
            if (data.text.includes("```")) {
                const match = data.text.match(/```(?:[a-zA-Z]+)?\n([\s\S]*?)```/)
                if (match && match[1]) setCurrentCode(match[1].trim())
            }
        })

        socket.on('transcript-update', (data: any) => {
            setChat(prev => [...prev, { role: 'user', text: data.text }])
        })

        socket.on('code-output', (data: any) => {
            setCodeOutput(data)
            setIsRunning(false)
        })

        socket.on('error', (data: any) => {
            setCodeOutput(data)
            setIsRunning(false)
        })

        socket.on('technical-evaluation', (data: any) => {
            setIsSubmitting(false)
            setDifficultyScore(data.difficulty_score || difficultyScore)
            setCurrentLevel(data.current_level || currentLevel)

            // If there's a next question, set it
            if (data.next_question) {
                setChat(prev => [...prev, { role: 'ai', text: data.next_question }])
                if (data.next_initial_code) setCurrentCode(data.next_initial_code)
                setStartTime(Date.now()) // Reset timer for next question
                setCurrentQuestionIdx(prev => prev + 1)
            } else if (data.question) {
                // Initial question arrival
                setChat(prev => [...prev, { role: 'ai', text: data.question }])
                if (data.initial_code) setCurrentCode(data.initial_code)
                setStartTime(Date.now())
            } else {
                // End of interview
                finishInterview(data.finalReportId)
            }
        })

        return () => {
            socket.off('ai-response')
            socket.off('code-output')
            socket.off('technical-evaluation')
        }
    }, [currentQuestionIdx, setupInfo])

    const handleRunCode = (lang: string, code: string) => {
        setIsRunning(true)
        socket.emit('code-run', { lang, code })
    }

    const handleSubmit = () => {
        setIsSubmitting(true)
        const duration = Math.floor((Date.now() - startTime) / 1000)

        socket.emit('technical-submit', {
            userId: localStorage.getItem("userId") || "anonymous",
            question: chat.filter(m => m.role === 'ai').slice(-1)[0]?.text || "",
            code: currentCode,
            output: codeOutput,
            duration,
            violations: violations.length
        })
    }

    return (
        <div className="h-screen bg-zinc-950 text-white flex flex-col overflow-hidden">
            {/* Nav Header - Responsive */}
            <header className="h-14 sm:h-16 border-b border-white/5 bg-black px-4 sm:px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded flex items-center justify-center">
                            <Brain className="text-black w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <span className="font-black uppercase tracking-widest text-xs sm:text-sm">Tech Pro</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
                    {/* Timer - Always visible */}
                    <div className="flex items-center gap-2 bg-zinc-900/50 px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl border border-white/5">
                        <Timer className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                        <span className="font-mono text-xs sm:text-sm font-bold">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                    </div>

                    {/* Security badge - Hidden on mobile */}
                    <div className="hidden md:flex items-center gap-3 bg-zinc-900/50 px-4 py-2 rounded-xl border border-white/5">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold uppercase tracking-widest">Secure</span>
                    </div>
                </div>

                {/* Progress - Compact on mobile */}
                <div className="flex items-center gap-2">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500 hidden sm:inline">Question</span>
                    <div className="flex gap-0.5 sm:gap-1">
                        {Array.from({ length: setupInfo?.questions || 5 }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-4 sm:w-6 h-1 rounded-full transition-all ${i + 1 <= currentQuestionIdx ? 'bg-primary' : 'bg-zinc-800'}`}
                            />
                        ))}
                    </div>
                </div>
            </header>

            {/* Mobile Tabs - Only visible on mobile */}
            <div className="md:hidden flex border-b border-white/5 bg-black">
                <button
                    onClick={() => setActivePanel('chat')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activePanel === 'chat' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-zinc-500'
                        }`}
                >
                    Chat
                </button>
                <button
                    onClick={() => setActivePanel('code')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activePanel === 'code' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-zinc-500'
                        }`}
                >
                    Code
                </button>
                <button
                    onClick={() => setActivePanel('output')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activePanel === 'output' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-zinc-500'
                        }`}
                >
                    Output
                </button>
            </div>

            {/* Main Interactive Grid - Responsive */}
            <main className="flex-1 min-h-0 flex flex-col md:flex-row gap-0 md:gap-4 p-0 md:p-4 overflow-hidden">
                {/* Chat Panel - Sidebar on desktop, tab on mobile */}
                <div className={`
                    ${activePanel === 'chat' ? 'flex' : 'hidden'} md:flex
                    w-full md:w-[400px] flex-col gap-4 shrink-0 p-4 md:p-0
                `}>
                    <Card className="h-32 sm:h-40 md:h-48 bg-black/40 border-white/5 flex items-center justify-center p-0 relative overflow-hidden shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60 z-10" />
                        <img src="/ai-avatar.jpg" className="w-full h-full object-cover" alt="AI" />
                        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-20 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-white/80">AI active</span>
                        </div>
                    </Card>

                    <div className="flex-1 min-h-0">
                        <RealTimeScript transcript={chat} isProcessing={false} isInInterview={true} />
                    </div>
                </div>

                {/* Code Editor Panel - Full width on mobile */}
                <div className={`
                    ${activePanel === 'code' ? 'flex' : 'hidden'} md:flex
                    flex-1 flex-col gap-4 min-w-0 p-4 md:p-0
                `}>
                    <div className="flex-1 min-h-0">
                        <CodeSandbox
                            code={currentCode}
                            onChange={(val) => setCurrentCode(val || "")}
                            onRun={handleRunCode}
                            output={codeOutput}
                            isRunning={isRunning}
                        />
                    </div>

                    {/* Desktop controls - Hidden on mobile (use FABs instead) */}
                    <Card className="hidden md:flex h-20 bg-black/40 border-white/5 px-6 items-center justify-between shrink-0">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                className={`w-12 h-12 rounded-full border-2 ${isRecording ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-white/10 bg-white/5'}`}
                                onClick={() => isRecording ? stopRecording() : startRecording()}
                            >
                                {isRecording ? <MicOff /> : <Mic />}
                            </Button>
                            <span className="text-sm font-medium text-zinc-400">
                                {isRecording ? "Listening..." : "Click mic to speak"}
                            </span>
                        </div>

                        <Button
                            size="lg"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !currentCode}
                            className="bg-primary text-black hover:bg-primary/90 font-black uppercase tracking-widest px-10 h-12 rounded-xl flex items-center gap-3 shadow-xl shadow-primary/10"
                        >
                            {isSubmitting ? "Evaluating..." : (currentQuestionIdx === (setupInfo?.questions || 5) ? "Finish" : "Submit")}
                            <Send className="w-4 h-4" />
                        </Button>
                    </Card>
                </div>

                {/* Output Panel - Tab on mobile */}
                <div className={`
                    ${activePanel === 'output' ? 'flex' : 'hidden'} md:hidden
                    flex-1 flex-col p-4 overflow-auto
                `}>
                    <Card className="bg-black/40 border-white/5 p-4">
                        <h3 className="text-sm font-bold text-primary mb-3">Output</h3>
                        {codeOutput.stdout && (
                            <div className="space-y-2">
                                <p className="text-xs text-zinc-500 font-bold uppercase">stdout:</p>
                                <pre className="text-xs text-green-400 font-mono bg-black/50 p-3 rounded-lg overflow-x-auto">{codeOutput.stdout}</pre>
                            </div>
                        )}
                        {codeOutput.stderr && (
                            <div className="space-y-2 mt-3">
                                <p className="text-xs text-zinc-500 font-bold uppercase">stderr:</p>
                                <pre className="text-xs text-red-400 font-mono bg-black/50 p-3 rounded-lg overflow-x-auto">{codeOutput.stderr}</pre>
                            </div>
                        )}
                        {codeOutput.error && (
                            <div className="space-y-2 mt-3">
                                <p className="text-xs text-zinc-500 font-bold uppercase">error:</p>
                                <pre className="text-xs text-red-400 font-mono bg-black/50 p-3 rounded-lg overflow-x-auto">{codeOutput.error}</pre>
                            </div>
                        )}
                        {!codeOutput.stdout && !codeOutput.stderr && !codeOutput.error && (
                            <p className="text-sm text-zinc-600 italic">No output yet. Run your code to see results.</p>
                        )}
                    </Card>
                </div>
            </main>

            {/* Mobile Floating Action Buttons */}
            <div className="md:hidden fixed bottom-6 right-4 flex flex-col gap-3 z-40">
                <Button
                    onClick={() => handleRunCode('python', currentCode)}
                    disabled={isRunning}
                    className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 active:scale-95 transition-transform"
                >
                    <Play className="w-6 h-6" />
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !currentCode}
                    className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-black shadow-lg shadow-primary/30 active:scale-95 transition-transform"
                >
                    <Send className="w-6 h-6" />
                </Button>
            </div>

            {/* Warning Overlay */}
            <AnimatePresence>
                {warning && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="fixed bottom-10 left-0 right-0 z-50 flex justify-center pointer-events-none"
                    >
                        <div className="bg-red-600 px-8 py-4 rounded-3xl shadow-3xl flex items-center gap-4 border border-white/20">
                            <div className="bg-white/20 p-2 rounded-full">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="font-black text-xs uppercase tracking-widest text-white/80">Security Warning</h4>
                                <p className="text-sm font-bold text-white">{warning}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Overlay */}
            <AnimatePresence>
                {isInterviewOver && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center"
                    >
                        <div className="text-center space-y-8">
                            <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto shadow-[0_0_100px_rgba(var(--primary),0.5)]"
                            >
                                <Trophy className="text-black w-12 h-12" />
                            </motion.div>
                            <div className="space-y-4">
                                <h2 className="text-4xl font-black uppercase tracking-tighter">Round Completed</h2>
                                <p className="text-zinc-500 font-medium tracking-[0.5em] uppercase">Generating your report card...</p>
                            </div>
                            <div className="flex gap-2 justify-center">
                                {[1, 2, 3].map(i => (
                                    <motion.div
                                        key={i}
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                                        className="w-3 h-3 bg-primary rounded-full"
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
