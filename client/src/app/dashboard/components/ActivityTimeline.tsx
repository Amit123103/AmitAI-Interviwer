"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Zap,
    Play,
    CreditCard,
    History,
    Clock,
    Trophy,
    ArrowUpRight,
    Rocket
} from 'lucide-react'

interface ActivityItem {
    id: string
    type: 'interview' | 'coding' | 'payment' | 'milestone'
    title: string
    subtitle: string
    timestamp: string
    status: 'success' | 'pending' | 'failed'
}

export default function ActivityTimeline({ userId }: { userId: string }) {
    const [activities, setActivities] = useState<ActivityItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const token = localStorage.getItem("token")
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/user/activity`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    setActivities(await res.json())
                }
            } catch (err) {
                console.warn("Activity fetch failed:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchActivity()
    }, [userId])

    return (
        <div className="neural-card p-8 md:p-10 space-y-10 bg-slate-900/40 backdrop-blur-2xl border border-white/5">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <History className="w-4 h-4 text-blue-500" />
                    </div>
                    Recent Activity
                </h3>
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    <Clock className="w-3 h-3 text-emerald-500" /> Live Updates
                </span>
            </div>

            <div className="space-y-6">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 animate-pulse bg-white/5 rounded-2xl" />
                        ))}
                    </div>
                ) : activities.length === 0 ? (
                    <div className="py-14 text-center flex flex-col items-center gap-5 group/empty">
                        <div className="w-20 h-20 rounded-full bg-blue-500/5 flex items-center justify-center border border-blue-500/10 group-hover/empty:border-blue-500/30 transition-all duration-700 shadow-inner">
                            <Rocket className="w-10 h-10 text-blue-500 animate-bounce" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-lg font-bold text-white tracking-tight">Your journey starts here 🚀</p>
                            <p className="text-xs text-slate-500 font-medium max-w-[240px] mx-auto leading-relaxed">
                                Complete a quiz or interview to unlock insights and track your progress.
                            </p>
                        </div>
                    </div>
                ) : (
                    activities.map((act, i) => (
                        <div
                            key={act.id}
                            className="flex gap-5 group"
                        >
                            <div className="flex flex-col items-center">
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border border-white/5 transition-all group-hover:border-white/10 ${act.type === 'interview' ? 'bg-blue-500/5 text-blue-500' :
                                    act.type === 'coding' ? 'bg-emerald-500/5 text-emerald-400' :
                                        act.type === 'payment' ? 'bg-blue-500/5 text-blue-500' :
                                            'bg-indigo-500/5 text-indigo-400'
                                    }`}>
                                    {act.type === 'interview' ? <Play className="w-4 h-4" /> :
                                        act.type === 'coding' ? <Zap className="w-4 h-4" /> :
                                            act.type === 'payment' ? <CreditCard className="w-4 h-4" /> :
                                                <Trophy className="w-4 h-4" />}
                                </div>
                                {i !== activities.length - 1 && <div className="w-[1px] h-full bg-white/5 mt-3" />}
                            </div>
                            <div className="flex-1 pb-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-sm font-bold text-white group-hover:text-blue-500 transition-colors uppercase tracking-tight">{act.title}</h4>
                                        <p className="text-xs font-medium text-slate-500 mt-1">{act.subtitle}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${act.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                                            act.status === 'pending' ? 'bg-blue-500/10 text-blue-500' :
                                                'bg-red-500/10 text-red-500'
                                            }`}>
                                            {act.status === 'success' ? 'Completed' : act.status === 'pending' ? 'Pending' : 'Failed'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button className="w-full py-4 bg-white/5 border border-white/5 hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-blue-500 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]">
                View Progress Dashboard <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
        </div>
    )
}
