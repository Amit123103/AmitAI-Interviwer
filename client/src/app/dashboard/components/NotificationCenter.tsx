"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, X, Clock, Bell, Info, AlertTriangle, Zap } from 'lucide-react'
import io from 'socket.io-client'

interface Announcement {
    _id: string
    title: string
    content: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    createdAt: string
}

export default function NotificationCenter() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [isVisible, setIsVisible] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const token = localStorage.getItem("token")
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/content/announcements`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setAnnouncements(data)
                    setUnreadCount(data.length)
                }
            } catch (err) {
                console.error(err)
            }
        }
        fetchAnnouncements()

        // Socket Listener
        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001')
        socket.on('platform:announcement', (newAnn: Announcement) => {
            setAnnouncements(prev => [newAnn, ...prev])
            setUnreadCount(prev => prev + 1)
        })

        return () => { socket.disconnect() }
    }, [])

    return (
        <div className="relative">
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
            >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-violet-400 animate-bounce' : 'text-zinc-400'}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-black">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10, x: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10, x: -20 }}
                        className="absolute right-0 mt-4 w-80 sm:w-96 bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-violet-400 flex items-center gap-2">
                                <Megaphone className="w-4 h-4" /> Notifications
                            </h3>
                            <button onClick={() => setIsVisible(false)} className="text-zinc-500 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar p-6 space-y-4">
                            {announcements.length === 0 ? (
                                <div className="py-10 text-center space-y-3">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-zinc-600">
                                        <Info className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs text-zinc-600">No notifications yet</p>
                                </div>
                            ) : (
                                announcements.map((ann) => (
                                    <div
                                        key={ann._id}
                                        className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden"
                                    >
                                        <div className={`absolute top-0 left-0 w-1 h-full ${ann.priority === 'urgent' ? 'bg-red-500' : ann.priority === 'high' ? 'bg-orange-500' : 'bg-violet-500'}`} />
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-medium ${ann.priority === 'urgent' ? 'bg-red-500/20 text-red-400' : 'bg-violet-500/20 text-violet-400'}`}>
                                                {ann.priority}
                                            </span>
                                            <span className="text-[9px] font-mono text-zinc-600">{new Date(ann.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="text-sm font-semibold text-white mb-1">{ann.title}</h4>
                                        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{ann.content}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
                            <button className="text-xs font-medium text-zinc-500 hover:text-white transition-colors">
                                Mark all as read
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
