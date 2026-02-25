"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollText, Mic, Bot } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface RealTimeScriptProps {
    transcript: {
        role: 'ai' | 'user',
        text: string,
        evaluation?: {
            technical_score?: number,
            communication_score?: number,
            confidence_level?: string,
            feedback?: string,
            composite_score?: number
        }
    }[];
    isProcessing: boolean;
    isInInterview: boolean;
    interimTranscript?: string;
    isListening?: boolean;
    volume?: number;
}

export default function RealTimeScript({
    transcript,
    isProcessing,
    isInInterview,
    interimTranscript,
    isListening,
    volume = 0
}: RealTimeScriptProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    // Auto-scroll logic
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [transcript, isProcessing])

    return (
        <Card className="h-full bg-zinc-900/50 border-white/5 flex flex-col overflow-hidden rounded-3xl backdrop-blur-md">
            <CardHeader className="bg-black/40 border-b border-white/5 py-4 px-6 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <ScrollText className="w-4 h-4 text-primary" />
                    </div>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-4">
                        Live Transcript
                        {isListening && (
                            <div className="flex gap-0.5 h-3 items-end">
                                {[...Array(8)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: isListening ? [4, Math.random() * 12 + 4, 4] : 4 }}
                                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                                        className="w-1 bg-primary rounded-full"
                                        style={{ height: `${Math.min(4 + (volume * (i + 1) / 4), 12)}px` }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardTitle>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 relative overflow-hidden flex flex-col">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    <AnimatePresence>
                        {transcript.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40"
                            >
                                <ScrollText className="w-12 h-12 mb-4 text-zinc-600" />
                                <p className="text-sm text-zinc-500 font-medium">Waiting for conversation to start...</p>
                            </motion.div>
                        )}

                        {transcript.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                            >
                                <div className={`max-w-[85%] flex flex-col gap-1 ${msg.role === 'ai' ? 'items-start' : 'items-end'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        {msg.role === 'ai' ? (
                                            <>
                                                <Bot className="w-3 h-3 text-primary" />
                                                <span className="text-[10px] uppercase font-black tracking-widest text-primary">Interviewer</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400">You</span>
                                                <Mic className="w-3 h-3 text-zinc-400" />
                                            </>
                                        )}
                                    </div>

                                    <div className={`p-4 rounded-2xl text-sm leading-7 shadow-lg backdrop-blur-sm
                                        ${msg.role === 'ai'
                                            ? 'bg-white/5 border border-white/10 text-zinc-100 rounded-tl-none'
                                            : 'bg-primary text-white font-semibold rounded-tr-none shadow-primary/10'
                                        }`}
                                    >
                                        {msg.text}
                                    </div>

                                    {/* Inline Evaluation for User Responses */}
                                    {msg.role === 'user' && msg.evaluation && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="mt-2 w-full max-w-sm bg-zinc-900/80 border border-white/5 p-3 rounded-2xl shadow-2xl backdrop-blur-md"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex gap-1.5">
                                                    <div className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-[9px] font-black text-blue-400 uppercase">Comm: {msg.evaluation.communication_score}</div>
                                                    <div className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-black text-emerald-400 uppercase">Tech: {msg.evaluation.technical_score}</div>
                                                </div>
                                                <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Score: {msg.evaluation.composite_score || (msg.evaluation.technical_score! + msg.evaluation.communication_score!) / 2}</span>
                                            </div>
                                            {msg.evaluation.feedback && (
                                                <p className="text-[11px] text-zinc-400 italic leading-relaxed border-t border-white/5 pt-2 mt-2">
                                                    "{msg.evaluation.feedback}"
                                                </p>
                                            )}
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Interim Transcript (Real-time user speech) */}
                    {interimTranscript && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-end w-full"
                        >
                            <div className="max-w-[85%] flex flex-col gap-1 items-end opacity-70">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400">You (Speaking...)</span>
                                    <Mic className="w-3 h-3 text-zinc-400 animate-pulse" />
                                </div>
                                <div className="p-4 rounded-2xl text-sm leading-7 shadow-lg backdrop-blur-sm bg-primary/20 text-white font-semibold rounded-tr-none border border-primary/20 italic">
                                    {interimTranscript}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Processing / Typing Indicator */}
                    {isProcessing && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start w-full"
                        >
                            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-3 w-fit">
                                <div className="flex gap-1.5 h-2">
                                    {[1, 2, 3].map(i => (
                                        <motion.div
                                            key={i}
                                            animate={{
                                                scale: [1, 1.5, 1],
                                                opacity: [0.3, 1, 0.3]
                                            }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 1,
                                                delay: i * 0.2,
                                                ease: "easeInOut"
                                            }}
                                            className="w-2 h-2 bg-primary rounded-full"
                                        />
                                    ))}
                                </div>
                                <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 animate-pulse">
                                    Analyzing Response...
                                </span>
                            </div>
                        </motion.div>
                    )}

                    {/* Invisible spacer for scrolling */}
                    <div className="h-4" />
                </div>
            </CardContent>
        </Card>
    )
}
