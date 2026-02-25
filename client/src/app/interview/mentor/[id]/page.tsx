"use client"

import React, { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { socket } from "@/lib/socket"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Brain, User, MessageSquare, TrendingUp, Zap, Send, ShieldAlert, Loader2, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function MentorPage() {
    const params = useParams()
    const router = useRouter()
    const [transcript, setTranscript] = useState<{ role: string, text: string }[]>([])
    const [stats, setStats] = useState({ confidence: 50, emotion: 'Neutral' })
    const [hint, setHint] = useState("")
    const [isConnected, setIsConnected] = useState(false)
    const [monitoringEvents, setMonitoringEvents] = useState<any[]>([])
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        socket.connect()

        const user = JSON.parse(localStorage.getItem("user") || "{}")
        if (!user._id) {
            router.push("/login")
            return
        }

        socket.emit('join-interview', {
            userId: user._id,
            candidateId: params.id,
            role: 'mentor'
        })

        socket.on('mentor-joined', () => {
            setIsConnected(true)
            console.log("Joined as mentor")
        })

        socket.on('transcript-update', (data: any) => {
            setTranscript(prev => [...prev, data])
        })

        socket.on('realtime-confidence', (data: any) => {
            setStats(data)
        })

        socket.on('mentor-monitoring-update', (event: any) => {
            setMonitoringEvents(prev => [event, ...prev].slice(0, 5))
        })

        socket.on('ai-hint', (data: any) => {
            if (data.isMentor) {
                // Also show mentor's own hints in the transcript for clarity
                setTranscript(prev => [...prev, { role: 'mentor', text: data.text }])
            }
        })

        return () => {
            socket.off('mentor-joined')
            socket.off('transcript-update')
            socket.off('realtime-confidence')
            socket.off('mentor-monitoring-update')
            socket.off('ai-hint')
        }
    }, [params.id])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [transcript])

    const sendHint = () => {
        if (!hint.trim()) return
        socket.emit('mentor-hint', { text: hint })
        setHint("")
    }

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 sm:p-10">
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-primary mb-4" />
                <h2 className="text-lg sm:text-xl font-bold">Connecting to Room...</h2>
                <p className="text-zinc-500 text-xs sm:text-sm mt-2">Waiting for candidate session: {params.id}</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="bg-zinc-900 border-zinc-800 h-10 w-10"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                Mentor Dashboard
                            </h1>
                            <p className="text-zinc-500 text-[10px] sm:text-xs">Observing: <span className="text-zinc-300 font-mono">{params.id}</span></p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="px-2 sm:px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] sm:text-[10px] font-bold uppercase flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Live
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel: Stats & Monitoring */}
                    <div className="space-y-6">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Real-time Biometrics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-zinc-400">Confidence Level</span>
                                        <span className="text-primary font-bold">{stats.confidence}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-primary"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${stats.confidence}%` }}
                                            transition={{ type: "spring", stiffness: 50 }}
                                        />
                                    </div>
                                </div>
                                <div className="p-4 bg-black rounded-xl border border-zinc-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Brain className="w-5 h-5 text-purple-400" />
                                        <span className="text-sm">Dominant Emotion</span>
                                    </div>
                                    <span className="text-lg font-black text-white">{stats.emotion}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-red-400" />
                                    Security & Behavior
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <AnimatePresence>
                                    {monitoringEvents.length > 0 ? (
                                        monitoringEvents.map((event, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg flex justify-between items-center"
                                            >
                                                <span className="text-[10px] font-bold text-red-400 uppercase">{event.type.replace('_', ' ')}</span>
                                                <span className="text-[10px] text-zinc-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-zinc-600 text-center py-4">No violations detected</p>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Middle Panel: Live Transcript */}
                    <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800 flex flex-col h-[600px]">
                        <CardHeader className="border-b border-zinc-800">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Live Transcript Feed
                            </CardTitle>
                        </CardHeader>
                        <CardContent
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
                        >
                            {transcript.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-blue-600/10 border border-blue-600/20 text-blue-200'
                                        : msg.role === 'mentor'
                                            ? 'bg-primary/10 border border-primary/20 text-primary'
                                            : 'bg-zinc-800/50 border border-zinc-700 text-zinc-300'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            {msg.role === 'user' ? <User className="w-3 h-3" /> : <Brain className="w-3 h-3" />}
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">
                                                {msg.role === 'user' ? 'Candidate' : msg.role === 'mentor' ? 'Your Hint' : 'AI Interviewer'}
                                            </span>
                                        </div>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            {transcript.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-2">
                                    <Loader2 className="w-6 h-6 animate-spin opacity-20" />
                                    <p className="text-sm">Waiting for conversation to start...</p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="p-4 border-t border-zinc-800 bg-black/50">
                            <div className="flex w-full gap-2">
                                <Input
                                    placeholder="Type a hint for the candidate..."
                                    className="bg-zinc-900 border-zinc-800 focus:ring-primary text-white"
                                    value={hint}
                                    onChange={(e) => setHint(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendHint()}
                                />
                                <Button onClick={sendHint} className="bg-primary text-black hover:bg-primary/90">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        "Explain more technically",
                        "Be more concise",
                        "Use the STAR method",
                        "Elaborate on the project"
                    ].map((h) => (
                        <Button
                            key={h}
                            variant="outline"
                            className="bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white text-xs"
                            onClick={() => {
                                socket.emit('mentor-hint', { text: h })
                            }}
                        >
                            {h}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    )
}
