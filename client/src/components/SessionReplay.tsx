"use client"

import React, { useRef, useState } from "react"
import { motion } from "framer-motion"
import { Play, Pause, AlertCircle, MessageSquare, User, Clock } from "lucide-react"

type EventLog = {
    eventType: string;
    timestamp: number;
    metadata?: any;
}

export default function SessionReplay({ videoUrl, eventLogs }: { videoUrl: string, eventLogs: EventLog[] }) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause()
            else videoRef.current.play()
            setIsPlaying(!isPlaying)
        }
    }

    const seek = (timeMs: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = timeMs / 1000
            setCurrentTime(timeMs / 1000)
        }
    }

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60)
        const secs = Math.floor(time % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="space-y-6">
            <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-white/5 group shadow-2xl">
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={togglePlay}
                    onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                    onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                />

                {/* Controls Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-4">
                    <button onClick={togglePlay} className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors text-white">
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>
                    <div className="flex-1 text-[10px] font-bold text-zinc-400 font-mono">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                </div>
            </div>

            {/* Smart Timeline Card */}
            <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                        <Clock className="w-3 h-3 text-primary" /> Behavioral Event Timeline
                    </h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Focus
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> AI
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" /> You
                        </div>
                    </div>
                </div>

                <div className="relative h-20 flex items-center group">
                    {/* Background Track */}
                    <div className="absolute inset-x-0 h-1.5 bg-white/5 rounded-full" />

                    {/* Progress Bar */}
                    <motion.div
                        className="absolute h-1.5 bg-primary/30 rounded-full"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />

                    {/* Current Scrub Handle */}
                    <motion.div
                        className="absolute w-0.5 h-8 bg-primary z-20"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                    />

                    {/* Event Markers */}
                    {eventLogs.map((event, i) => {
                        const position = (event.timestamp / 1000 / duration) * 100
                        if (position > 100) return null

                        return (
                            <div
                                key={i}
                                className="absolute group/marker"
                                style={{ left: `${position}%` }}
                            >
                                <button
                                    onClick={() => seek(event.timestamp)}
                                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-all hover:scale-150 relative z-10 -translate-x-1/2 -translate-y-1/2 ${event.eventType === 'focus_loss' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                                            event.eventType === 'ai_response' ? 'bg-blue-400' : 'bg-primary'
                                        }`}
                                >
                                    {event.eventType === 'focus_loss' ? (
                                        <AlertCircle className="w-2.5 h-2.5 text-white" />
                                    ) : event.eventType === 'ai_response' ? (
                                        <MessageSquare className="w-2.5 h-2.5 text-black" />
                                    ) : (
                                        <User className="w-2.5 h-2.5 text-black" />
                                    )}
                                </button>

                                {/* Tooltip */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-800 text-[9px] p-2 rounded-lg opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap border border-white/10 z-30 pointer-events-none">
                                    <span className="font-black uppercase block mb-1 opacity-50">{event.eventType.replace('_', ' ')}</span>
                                    {event.metadata?.text ? `"${event.metadata.text.substring(0, 30)}..."` : 'Moment Captured'}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
