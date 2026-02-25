"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, AlertCircle, ArrowRight, Brain, Monitor } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { socket } from "@/lib/socket"
import { Card } from "@/components/ui/card"
import RealTimeScript from "@/components/RealTimeScript"
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

export default function SystemDesignPage() {
    const router = useRouter()
    const [isRecording, setIsRecording] = useState(false)
    const [isInterviewOver, setIsInterviewOver] = useState(false)
    const [chat, setChat] = useState<{ role: 'ai' | 'user', text: string }[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [hasStarted, setHasStarted] = useState(false)
    const [errorData, setErrorData] = useState<{ message: string, type: 'error' | 'warning' } | null>(null)
    const [reportId, setReportId] = useState<string | null>(null)

    // Mobile panel management
    const [activePanel, setActivePanel] = useState<'whiteboard' | 'chat'>('whiteboard')
    const tldrawEditorRef = useRef<any>(null)

    // Audio Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const aiAudioRef = useRef<HTMLAudioElement | null>(null)
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const recognitionRef = useRef<any>(null)
    const [interimTranscript, setInterimTranscript] = useState("")

    const [currentStep, setCurrentStep] = useState(1)
    const sessionStartTimeRef = useRef<number>(0)
    const eventLogsRef = useRef<any[]>([])

    // WebSocket Integration
    useEffect(() => {
        socket.connect()

        socket.on("connect", () => {
            console.log("Connected to WebSocket server (System Design)")
            const userStr = localStorage.getItem("user")
            if (userStr) {
                const user = JSON.parse(userStr)
                socket.emit('join-interview', {
                    userId: user._id,
                    difficulty: localStorage.getItem("interview_difficulty") || 'Intermediate',
                    totalQuestions: parseInt(localStorage.getItem("interview_count") || '5'), // Fewer questions for system design
                    voice: localStorage.getItem("interview_voice") || 'Female (Alloy)',
                    sector: 'System Design', // Forced sector
                    persona: localStorage.getItem("interview_persona") || 'Friendly Mentor',
                })
            }
        })

        socket.on('ai-response', (data: any) => {
            const { text, audio, isLast, reportId } = data
            setChat(prev => [...prev, { role: 'ai', text }])

            if (reportId) setReportId(reportId)

            const timestamp = Date.now() - sessionStartTimeRef.current
            eventLogsRef.current.push({
                type: 'ai_response',
                timestamp,
                metadata: { text }
            })

            if (audio) playAIAudio(audio, isLast)
            setIsProcessing(false)
        })

        socket.on('transcript-update', (data: any) => {
            if (data.role === 'user') {
                setChat(prev => [...prev, { role: 'user', text: data.text }])
                const timestamp = Date.now() - sessionStartTimeRef.current
                eventLogsRef.current.push({ type: 'user_response', timestamp, metadata: { text: data.text } })
                setCurrentStep(prev => prev + 1)
            }
        })

        socket.on('error', (data: any) => {
            console.error("Socket error:", data)
            setIsProcessing(false)
            setErrorData({ message: data.message || "Connection issue.", type: 'error' })
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    const startRecording = async () => {
        try {
            if (isRecording) return
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            // Silence Detection
            const audioContext = new AudioContext()
            audioContextRef.current = audioContext
            const source = audioContext.createMediaStreamSource(stream)
            const analyser = audioContext.createAnalyser()
            analyser.fftSize = 256
            source.connect(analyser)
            analyserRef.current = analyser
            const dataArray = new Uint8Array(analyser.frequencyBinCount)

            const checkSilence = () => {
                if (!analyserRef.current) return
                analyserRef.current.getByteFrequencyData(dataArray)
                const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length

                // Barge-in
                if (avg > 20 && aiAudioRef.current && !aiAudioRef.current.paused) {
                    aiAudioRef.current.pause()
                    aiAudioRef.current.currentTime = 0
                }

                if (avg < 10) {
                    if (!silenceTimerRef.current) {
                        silenceTimerRef.current = setTimeout(() => {
                            if (mediaRecorder.state === "recording") {
                                console.log("Silence detected (System Design), stopping...")
                                mediaRecorder.stop()
                                setIsProcessing(true)
                            }
                        }, 2000) // Longer silence for system design thinking
                    }
                } else {
                    if (silenceTimerRef.current) {
                        clearTimeout(silenceTimerRef.current)
                        silenceTimerRef.current = null
                    }
                }

                if (mediaRecorder.state === "recording") {
                    requestAnimationFrame(checkSilence)
                }
            }

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                socket.emit('audio-response', {
                    audio: blob,
                    currentQuestion: currentStep,
                    emotion: 'Neutral', // No visual emotion in this mode yet
                    focusScore: 100,
                    canvas_snapshot: tldrawEditorRef.current ? JSON.stringify(tldrawEditorRef.current.store.getSnapshot()) : null
                })
                setIsRecording(false)
                audioContext.close()
                analyserRef.current = null
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
            }

            mediaRecorder.start()
            setIsRecording(true)
            requestAnimationFrame(checkSilence)
        } catch (err) {
            console.error("Mic error:", err)
        }
    }

    const playAIAudio = (base64Audio: string, isLast?: boolean) => {
        if (aiAudioRef.current) {
            aiAudioRef.current.pause();
            aiAudioRef.current.currentTime = 0;
        }
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`)
        aiAudioRef.current = audio
        setIsSpeaking(true)

        audio.onended = () => {
            setIsSpeaking(false)
            if (isLast) {
                setIsInterviewOver(true)
                return
            }
            setTimeout(startRecording, 500)
        }
        audio.play()
    }

    const handleEndSession = () => {
        if (reportId) router.push(`/dashboard/report/${reportId}`)
        else router.push('/dashboard')
    }

    // Speech Recognition for real-time text
    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition
            const recognition = new SpeechRecognition()
            recognition.continuous = true
            recognition.interimResults = true
            recognition.lang = 'en-US'
            recognition.onresult = (event: any) => {
                let interim = ''
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (!event.results[i].isFinal) {
                        interim += event.results[i][0].transcript
                    }
                }
                setInterimTranscript(interim)
            }
            recognitionRef.current = recognition
        }
    }, [])

    useEffect(() => {
        const recognition = recognitionRef.current
        if (!recognition) return
        if (isRecording) {
            try { recognition.start() } catch (e) { }
        } else {
            recognition.stop()
            setInterimTranscript("")
        }
    }, [isRecording])


    return (
        <div className="h-screen bg-zinc-950 text-white flex flex-col overflow-hidden">
            {!hasStarted && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="text-center space-y-4 sm:space-y-6 p-6 sm:p-10 bg-zinc-900 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <Monitor className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-pulse" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">System Design Interface</h1>
                        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                            Use the whiteboard to draw your architecture. The AI will guide you through the design process.
                        </p>
                        <Button
                            className="w-full py-5 sm:py-6 text-base sm:text-lg font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white h-14 sm:h-auto shadow-[0_0_30px_rgba(5,150,105,0.3)]"
                            onClick={() => {
                                setHasStarted(true)
                                sessionStartTimeRef.current = Date.now()
                            }}
                        >
                            Enter Whiteboard
                        </Button>
                    </div>
                </div>
            )}

            {/* Header - Responsive */}
            <div className="h-12 sm:h-14 border-b border-zinc-800 flex items-center justify-between px-4 sm:px-6 bg-zinc-900/50">
                <div className="flex items-center gap-2 sm:gap-4">
                    <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span className="font-bold tracking-tight text-xs sm:text-sm md:text-base">System Design</span>
                </div>
                <Button variant="destructive" size="sm" onClick={handleEndSession} className="h-9 sm:h-10 text-xs sm:text-sm">
                    {isInterviewOver ? "View Report" : "End"}
                </Button>
            </div>

            {/* Mobile Tabs - Only visible on mobile */}
            <div className="lg:hidden flex border-b border-white/5 bg-black">
                <button
                    onClick={() => setActivePanel('whiteboard')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activePanel === 'whiteboard' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-zinc-500'
                        }`}
                >
                    Whiteboard
                </button>
                <button
                    onClick={() => setActivePanel('chat')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activePanel === 'chat' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-zinc-500'
                        }`}
                >
                    Chat
                </button>
            </div>

            {/* Main Content - Responsive */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Whiteboard - Full screen on mobile, left side on desktop */}
                <div className={`
                    ${activePanel === 'whiteboard' ? 'flex' : 'hidden'} lg:flex
                    flex-1 relative bg-zinc-950 text-white
                `}>
                    <div className="absolute inset-0">
                        <Tldraw
                            persistenceKey="system-design-interview"
                            onMount={(editor) => {
                                tldrawEditorRef.current = editor
                            }}
                        />
                    </div>
                </div>

                {/* Chat Panel - Tab on mobile, sidebar on desktop */}
                <div className={`
                    ${activePanel === 'chat' ? 'flex' : 'hidden'} lg:flex
                    w-full lg:w-[400px] border-l border-zinc-800 bg-black flex-col
                `}>
                    {/* AI Status */}
                    <div className="h-32 sm:h-40 lg:h-48 border-b border-zinc-800 relative bg-zinc-900/50 flex items-center justify-center">
                        <div className="absolute inset-0 overflow-hidden">
                            <img src="/robotic_interviewer_avatar.png" className="w-full h-full object-cover opacity-50" />
                        </div>
                        <div className="z-10 text-center">
                            <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full mx-auto mb-2 ${isSpeaking ? 'bg-green-500 animate-pulse' : isProcessing ? 'bg-yellow-500 animate-bounce' : 'bg-zinc-500'}`} />
                            <p className="text-xs sm:text-sm font-bold shadow-black drop-shadow-md">
                                {isSpeaking ? "Speaking..." : isProcessing ? "Thinking..." : "Listening..."}
                            </p>
                        </div>
                    </div>

                    {/* Chat */}
                    <div className="flex-1 overflow-hidden p-3 sm:p-4">
                        <RealTimeScript
                            transcript={chat}
                            isProcessing={isProcessing}
                            isInInterview={!isInterviewOver}
                            interimTranscript={interimTranscript}
                        />
                    </div>

                    {/* Controls - Hidden on mobile (use FAB instead) */}
                    <div className="hidden lg:block p-4 border-t border-zinc-800 bg-zinc-900">
                        <Button
                            className={`w-full py-6 font-bold uppercase tracking-widest ${isRecording ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-primary hover:bg-primary/90 text-white'}`}
                            onClick={() => {
                                if (isRecording) {
                                    mediaRecorderRef.current?.stop()
                                } else {
                                    startRecording()
                                }
                            }}
                            disabled={isInterviewOver}
                        >
                            {isRecording ? <div className="flex items-center gap-2"><MicOff /> Stop Recording</div> : <div className="flex items-center gap-2"><Mic /> Speak Answer</div>}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Floating Action Button */}
            <div className="lg:hidden fixed bottom-6 right-4 z-40">
                <Button
                    onClick={() => {
                        if (isRecording) {
                            mediaRecorderRef.current?.stop()
                        } else {
                            startRecording()
                        }
                    }}
                    disabled={isInterviewOver}
                    className={`h-14 w-14 rounded-full shadow-lg active:scale-95 transition-transform ${isRecording ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-primary hover:bg-primary/90 text-white shadow-primary/30'
                        }`}
                >
                    {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>
            </div>

        </div>
    )
}
