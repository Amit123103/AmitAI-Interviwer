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
    Inbox
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
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchActivity()
    }, [userId])

    return (
        <div className="glass-card-v2 p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                    <History className="w-4 h-4 text-violet-400" /> Recent Activity
                </h3>
                <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Updated just now
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
                    <div className="py-10 text-center opacity-50 flex flex-col items-center gap-3">
                        <Inbox className="w-10 h-10 text-zinc-600" />
                        <p className="text-sm text-zinc-500">No recent activity yet</p>
                        <p className="text-xs text-zinc-600">Complete an interview or coding challenge to see it here</p>
                    </div>
                ) : (
                    activities.map((act, i) => (
                        <motion.div
                            key={act.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex gap-4 group"
                        >
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 shadow-inner transition-all group-hover:scale-110 ${act.type === 'interview' ? 'bg-violet-500/10 text-violet-400' :
                                    act.type === 'coding' ? 'bg-emerald-500/10 text-emerald-400' :
                                        act.type === 'payment' ? 'bg-amber-500/10 text-amber-500' :
                                            'bg-blue-500/10 text-blue-400'
                                    }`}>
                                    {act.type === 'interview' ? <Play className="w-4 h-4 fill-current" /> :
                                        act.type === 'coding' ? <Zap className="w-4 h-4" /> :
                                            act.type === 'payment' ? <CreditCard className="w-4 h-4" /> :
                                                <Trophy className="w-4 h-4" />}
                                </div>
                                {i !== activities.length - 1 && <div className="w-[1px] h-full bg-white/5 mt-2" />}
                            </div>
                            <div className="flex-1 pb-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-sm font-semibold text-white group-hover:text-violet-400 transition-colors">{act.title}</h4>
                                        <p className="text-xs text-zinc-500 mt-0.5">{act.subtitle}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-xs text-zinc-500">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${act.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                                            act.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                                'bg-red-500/10 text-red-400'
                                            }`}>
                                            {act.status === 'success' ? 'Done' : act.status === 'pending' ? 'In progress' : 'Failed'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <button className="w-full h-11 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-semibold text-zinc-400 transition-all flex items-center justify-center gap-2">
                View all activity <ArrowUpRight className="w-3 h-3" />
            </button>
        </div>
    )
}
