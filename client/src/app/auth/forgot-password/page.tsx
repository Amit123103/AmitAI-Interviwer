"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowLeft, KeyRound, Sparkles, Shield, Send, CheckCircle2, Clock, RefreshCw, Wifi } from "lucide-react"
import MeshBackground from "../../dashboard/components/MeshBackground"
import axios from "axios"

/* ── Floating particle ── */
function FloatingParticle({ delay, size, color, x, y }: { delay: number; size: number; color: string; x: string; y: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0] }}
            transition={{ delay, duration: 4 + Math.random() * 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute pointer-events-none" style={{ left: x, top: y }}
        >
            <div className="rounded-full blur-[1px]" style={{ width: size, height: size, background: color }} />
        </motion.div>
    )
}

/* ── Gradient ring ── */
function GradientRing() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.5rem]">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-[1px] rounded-[2.5rem]"
                style={{
                    background: "conic-gradient(from 0deg, transparent 0%, #f59e0b 10%, transparent 20%, #f97316 30%, transparent 40%, #7c3aed 50%, transparent 60%, #ec4899 70%, transparent 80%, #06b6d4 90%, transparent 100%)",
                    opacity: 0.12,
                }}
            />
        </div>
    )
}

/* ── Animated envelope icon ── */
function AnimatedEnvelope() {
    return (
        <motion.div className="relative mx-auto w-20 h-20">
            {/* Envelope pulse rings */}
            {[0, 1, 2].map(i => (
                <motion.div
                    key={i}
                    animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
                    transition={{ duration: 2, delay: i * 0.6, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-2 rounded-2xl border border-amber-400/30"
                />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.4)]">
                        <Send className="text-white w-7 h-7 drop-shadow-lg" />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [focusedField, setFocusedField] = useState(false)
    const [cooldown, setCooldown] = useState(0)
    const [expiryCountdown, setExpiryCountdown] = useState(0)

    // Resend cooldown timer
    useEffect(() => {
        if (cooldown <= 0) return
        const t = setInterval(() => setCooldown(c => c - 1), 1000)
        return () => clearInterval(t)
    }, [cooldown])

    // Token expiry countdown
    useEffect(() => {
        if (expiryCountdown <= 0) return
        const t = setInterval(() => setExpiryCountdown(c => c - 1), 1000)
        return () => clearInterval(t)
    }, [expiryCountdown])

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60)
        const sec = s % 60
        return `${m}:${sec.toString().padStart(2, '0')}`
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address")
            return
        }

        setLoading(true)
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/forgot-password`, { email })
            setSuccess(true)
            setCooldown(60) // 60s cooldown before resend
            setExpiryCountdown(30 * 60) // 30 min expiry
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (cooldown > 0) return
        setLoading(true)
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/forgot-password`, { email })
            setCooldown(60)
            setExpiryCountdown(30 * 60)
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to resend")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#030305]">
            <MeshBackground variant="auth" />

            {/* ── Ambient blobs ── */}
            <div className="absolute top-[10%] right-[8%] w-[450px] h-[450px] bg-amber-500/[0.06] rounded-full blur-[150px] animate-pulse" />
            <div className="absolute bottom-[10%] left-[8%] w-[350px] h-[350px] bg-orange-500/[0.05] rounded-full blur-[130px]" />
            <div className="absolute top-[50%] left-[30%] w-[300px] h-[300px] bg-purple-500/[0.04] rounded-full blur-[120px]" />

            {/* ── Particles ── */}
            <FloatingParticle delay={0} size={4} color="#f59e0b" x="12%" y="25%" />
            <FloatingParticle delay={1.3} size={3} color="#f97316" x="82%" y="18%" />
            <FloatingParticle delay={0.6} size={5} color="#7c3aed" x="72%" y="68%" />
            <FloatingParticle delay={2.1} size={3} color="#ec4899" x="22%" y="78%" />
            <FloatingParticle delay={1.0} size={4} color="#06b6d4" x="88%" y="42%" />

            {/* ── Grid overlay ── */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: "linear-gradient(rgba(245,158,11,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.3) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }} />

            {/* ── Side accent ── */}
            <motion.div
                initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 2, delay: 0.3 }}
                className="absolute left-[5%] top-[15%] w-px h-[70%] origin-top hidden lg:block"
                style={{ background: "linear-gradient(to bottom, transparent, rgba(245,158,11,0.3), rgba(139,92,246,0.2), transparent)" }}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] shadow-[0_0_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] rounded-[2.5rem] overflow-hidden relative">
                    <GradientRing />
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.04] via-transparent to-purple-500/[0.03] pointer-events-none" />
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                    <CardHeader className="space-y-5 px-8 pt-10 pb-4 relative text-center">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.25 }}
                            className="relative mx-auto"
                        >
                            {success ? (
                                <AnimatedEnvelope />
                            ) : (
                                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(245,158,11,0.4)] relative">
                                    <KeyRound className="text-white w-8 h-8 drop-shadow-lg" />
                                    <motion.div
                                        animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.4, 1, 0.4] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full"
                                        style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 0 12px rgba(245,158,11,0.8)" }}
                                    />
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                        className="absolute -inset-2 rounded-2xl border border-dashed border-amber-500/20"
                                    />
                                </div>
                            )}
                        </motion.div>

                        <div className="space-y-2">
                            <CardTitle className="text-3xl font-black tracking-tighter italic uppercase">
                                <AnimatePresence mode="wait">
                                    {success ? (
                                        <motion.span key="sent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                                            LINK DISPATCHED
                                        </motion.span>
                                    ) : (
                                        <motion.span key="title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-r from-amber-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
                                            RECOVER ACCESS
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </CardTitle>
                            <CardDescription className="text-zinc-500 font-medium tracking-wide text-sm">
                                {success ? "Check your inbox for the magic link" : "Enter your email to receive a reset link"}
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <CardContent className="px-8 pb-4 space-y-4">
                                    {/* Success message */}
                                    <div className="bg-emerald-500/[0.06] backdrop-blur-lg p-5 rounded-xl border border-emerald-500/15 shadow-[0_0_30px_rgba(16,185,129,0.08)]">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-3" />
                                        <p className="text-emerald-400 text-sm font-bold text-center">
                                            Reset link sent to <strong className="text-white">{email}</strong>
                                        </p>
                                        <p className="text-zinc-600 text-xs mt-2 text-center">
                                            Check your spam folder if you don't see it.
                                        </p>
                                    </div>

                                    {/* Token expiry countdown */}
                                    {expiryCountdown > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="bg-amber-500/[0.06] backdrop-blur-lg p-4 rounded-xl border border-amber-500/15"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-amber-400" />
                                                    <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Link Expires In</span>
                                                </div>
                                                <span className="text-amber-300 text-lg font-black tabular-nums">{formatTime(expiryCountdown)}</span>
                                            </div>
                                            {/* Expiry progress bar */}
                                            <div className="mt-2 h-1 rounded-full bg-zinc-800/50 overflow-hidden">
                                                <motion.div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${(expiryCountdown / (30 * 60)) * 100}%`,
                                                        background: "linear-gradient(90deg, #f59e0b, #f97316)",
                                                        boxShadow: "0 0 12px rgba(245,158,11,0.4)"
                                                    }}
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Resend option */}
                                    <div className="flex justify-center">
                                        <button
                                            onClick={handleResend}
                                            disabled={cooldown > 0 || loading}
                                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
                                            style={{ color: cooldown > 0 ? '#71717a' : '#f59e0b' }}
                                        >
                                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                                            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Link"}
                                        </button>
                                    </div>
                                </CardContent>
                            </motion.div>
                        ) : (
                            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <form onSubmit={handleSubmit}>
                                    <CardContent className="space-y-5 px-8">
                                        <AnimatePresence>
                                            {error && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0, y: -10 }}
                                                    animate={{ opacity: 1, height: "auto", y: 0 }}
                                                    exit={{ opacity: 0, height: 0, y: -10 }}
                                                    className="text-red-400 text-xs font-black uppercase tracking-widest text-center bg-red-500/[0.08] backdrop-blur-lg p-3.5 rounded-xl border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                                                >
                                                    <span className="flex items-center justify-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                                        {error}
                                                    </span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 flex items-center gap-1.5">
                                                <Mail className="w-3 h-3 text-amber-400/60" />
                                                Registered Email
                                            </Label>
                                            <div className="relative group">
                                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField ? 'text-amber-400' : 'text-zinc-600'}`}>
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <Input
                                                    id="email" type="email" placeholder="m@example.com" required
                                                    value={email} onChange={e => setEmail(e.target.value)}
                                                    onFocus={() => setFocusedField(true)} onBlur={() => setFocusedField(false)}
                                                    className="h-14 pl-12 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-zinc-700 focus:bg-white/[0.06] focus:border-amber-500/40 focus:shadow-[0_0_25px_rgba(245,158,11,0.1)] transition-all duration-300 rounded-2xl"
                                                />
                                                <motion.div
                                                    animate={{ scaleX: focusedField ? 1 : 0 }}
                                                    className="absolute bottom-0 left-4 right-4 h-px origin-left"
                                                    style={{ background: "linear-gradient(90deg, #f59e0b, #f97316, #ec4899)" }}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="flex flex-col space-y-6 px-8 pb-10 pt-4">
                                        <Button
                                            className="w-full h-14 font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] group relative overflow-hidden transition-all duration-500 hover:-translate-y-0.5 border-0"
                                            type="submit" disabled={loading}
                                            style={{
                                                background: "linear-gradient(135deg, #f59e0b, #f97316, #ec4899)",
                                                boxShadow: "0 10px 40px rgba(245,158,11,0.3), 0 0 60px rgba(249,115,22,0.1)",
                                            }}
                                        >
                                            <motion.div
                                                animate={{ x: ["-100%", "200%"] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent w-1/2"
                                            />
                                            <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                                                {loading ? (
                                                    <>
                                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                                            <Send className="w-4 h-4" />
                                                        </motion.div>
                                                        Dispatching...
                                                    </>
                                                ) : (
                                                    <>
                                                        Send Reset Link
                                                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </span>
                                        </Button>
                                    </CardFooter>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="px-8 pb-8">
                        <div className="text-[11px] font-bold text-center text-zinc-500 tracking-wider">
                            <Link href="/auth/login" className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent hover:from-amber-300 hover:to-orange-300 transition-all uppercase tracking-[0.1em] flex items-center justify-center gap-1.5 font-black">
                                <ArrowLeft className="w-3 h-3 text-amber-400/70" />
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </Card>

                {/* ── Bottom badges ── */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-8 flex justify-center gap-6">
                    {[
                        { icon: Sparkles, label: "AI Secured", color: "text-amber-400/50" },
                        { icon: Shield, label: "256-bit", color: "text-purple-400/50" },
                        { icon: Wifi, label: "Instant Delivery", color: "text-cyan-400/50" },
                    ].map(({ icon: Icon, label, color }, i) => (
                        <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 + i * 0.15 }} className="flex items-center gap-1.5 text-zinc-600">
                            <Icon className={`w-3 h-3 ${color}`} />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    )
}
