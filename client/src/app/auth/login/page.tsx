"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Mail, Lock, Sparkles, Brain, ArrowRight, ArrowLeft, Shield, Fingerprint, Eye, EyeOff, Zap, Wifi, CheckCircle2 } from "lucide-react"
import Logo from "@/components/ui/Logo"
import MeshBackground from "../../dashboard/components/MeshBackground"
import axios from "axios"

/* ── Animated floating particle ── */
function FloatingParticle({ delay, size, color, x, y }: { delay: number; size: number; color: string; x: string; y: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0] }}
            transition={{ delay, duration: 4 + Math.random() * 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute pointer-events-none"
            style={{ left: x, top: y }}
        >
            <div className={`rounded-full blur-[1px]`} style={{ width: size, height: size, background: color }} />
        </motion.div>
    )
}

/* ── Animated gradient ring ── */
function GradientRing() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.5rem]">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-[1px] rounded-[2.5rem]"
                style={{
                    background: "conic-gradient(from 0deg, transparent 0%, #7c3aed 10%, transparent 20%, #ec4899 30%, transparent 40%, #06b6d4 50%, transparent 60%, #f59e0b 70%, transparent 80%, #10b981 90%, transparent 100%)",
                    opacity: 0.15,
                }}
            />
        </div>
    )
}

/* ── Scanning line animation ── */
function ScanLine() {
    return (
        <motion.div
            initial={{ top: "-2%" }}
            animate={{ top: "102%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-px z-30 pointer-events-none"
            style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.4) 30%, rgba(236,72,153,0.6) 50%, rgba(139,92,246,0.4) 70%, transparent 100%)",
                boxShadow: "0 0 20px rgba(139,92,246,0.3), 0 0 60px rgba(139,92,246,0.1)",
            }}
        />
    )
}

export default function LoginPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({ identifier: "", password: "" })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [loginSuccess, setLoginSuccess] = useState(false)
    const [focusedField, setFocusedField] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/login`, formData)
            localStorage.setItem("user", JSON.stringify(data))
            setLoginSuccess(true)
            setTimeout(() => router.push("/dashboard"), 1500)
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid credentials")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#030305]">
            <MeshBackground variant="auth" />

            {/* ── Ambient color blobs ── */}
            <div className="absolute top-[5%] left-[5%] w-[500px] h-[500px] bg-purple-600/[0.07] rounded-full blur-[150px] animate-pulse" />
            <div className="absolute bottom-[5%] right-[5%] w-[400px] h-[400px] bg-cyan-500/[0.06] rounded-full blur-[130px]" />
            <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-pink-500/[0.05] rounded-full blur-[120px]" />
            <div className="absolute bottom-[30%] left-[15%] w-[250px] h-[250px] bg-amber-500/[0.04] rounded-full blur-[100px]" />

            {/* ── Floating particles ── */}
            <FloatingParticle delay={0} size={4} color="#7c3aed" x="15%" y="20%" />
            <FloatingParticle delay={1.2} size={3} color="#ec4899" x="80%" y="15%" />
            <FloatingParticle delay={0.8} size={5} color="#06b6d4" x="70%" y="70%" />
            <FloatingParticle delay={2} size={3} color="#f59e0b" x="20%" y="75%" />
            <FloatingParticle delay={1.5} size={4} color="#10b981" x="85%" y="45%" />
            <FloatingParticle delay={0.5} size={3} color="#8b5cf6" x="10%" y="50%" />
            <FloatingParticle delay={2.5} size={4} color="#f472b6" x="50%" y="10%" />
            <FloatingParticle delay={1.8} size={3} color="#22d3ee" x="40%" y="85%" />

            {/* ── Grid overlay ── */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: "linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            {/* ── Side accent lines ── */}
            <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 2, delay: 0.3 }}
                className="absolute left-[5%] top-[10%] w-px h-[80%] origin-top hidden lg:block"
                style={{ background: "linear-gradient(to bottom, transparent, rgba(139,92,246,0.3), rgba(236,72,153,0.2), transparent)" }}
            />
            <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 2, delay: 0.6 }}
                className="absolute right-[5%] top-[15%] w-px h-[70%] origin-top hidden lg:block"
                style={{ background: "linear-gradient(to bottom, transparent, rgba(6,182,212,0.3), rgba(245,158,11,0.2), transparent)" }}
            />

            {/* ── Premium AI Greeting ── */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-lg hidden lg:block"
            >
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4 shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center">
                        <Logo size={44} showStatus />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] text-zinc-500 font-semibold tracking-wide">AMITAI Interview</p>
                        <p className="text-zinc-300 font-medium italic text-sm">"Welcome back! Ready to sharpen your skills today?"</p>
                    </div>
                    <motion.div
                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_15px_rgba(139,92,246,0.6)]"
                    />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md relative z-10"
            >
                {/* ── Back arrow ── */}
                <motion.button
                    onClick={() => router.back()}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="group flex items-center gap-2 mb-5 px-1 cursor-pointer"
                >
                    <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.1] group-hover:border-purple-500/30 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                        <ArrowLeft className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transition-colors duration-300 group-hover:-translate-x-0.5 transform" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 group-hover:text-zinc-400 transition-colors duration-300">Back</span>
                </motion.button>
                {/* ── Main card ── */}
                <Card className="bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] shadow-[0_0_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] rounded-[2.5rem] overflow-hidden relative">
                    <GradientRing />
                    {loading && <ScanLine />}

                    {/* Inner gradient sheen */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.04] via-transparent to-cyan-500/[0.03] pointer-events-none" />
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                    <CardHeader className="space-y-5 px-8 pt-10 pb-4 relative">
                        {/* Animated icon */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.25 }}
                            className="relative w-18 h-18 mx-auto"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(139,92,246,0.4)] relative">
                                <AnimatePresence mode="wait">
                                    {loginSuccess ? (
                                        <motion.div key="success" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                                            <CheckCircle2 className="text-white w-8 h-8 drop-shadow-lg" />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="trophy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, rotate: 90 }}>
                                            <Trophy className="text-white w-8 h-8 drop-shadow-lg" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {/* Pulsing corner dot */}
                                <motion.div
                                    animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.8)]"
                                    style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)" }}
                                />
                                {/* Orbiting ring */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="absolute -inset-2 rounded-2xl border border-dashed border-purple-500/20"
                                />
                            </div>
                        </motion.div>

                        <div className="space-y-2 text-center">
                            <CardTitle className="text-3xl font-black text-white tracking-tighter italic">
                                <AnimatePresence mode="wait">
                                    {loginSuccess ? (
                                        <motion.span key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                            ACCESS GRANTED
                                        </motion.span>
                                    ) : (
                                        <motion.span key="title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
                                            WELCOME BACK
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </CardTitle>
                            <CardDescription className="text-zinc-500 font-medium tracking-wide text-sm">
                                {loginSuccess ? "Initializing your dashboard..." : "Resume your journey to mastery"}
                            </CardDescription>
                        </div>
                    </CardHeader>

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

                            {/* Identity field */}
                            <div className="space-y-2">
                                <Label htmlFor="identifier" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 flex items-center gap-1.5">
                                    <Fingerprint className="w-3 h-3 text-purple-400/60" />
                                    Identity Key
                                </Label>
                                <div className="relative group">
                                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'identifier' ? 'text-purple-400' : 'text-zinc-600'}`}>
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <Input
                                        id="identifier"
                                        name="identifier"
                                        placeholder="Username or Email"
                                        required
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('identifier')}
                                        onBlur={() => setFocusedField(null)}
                                        className="h-14 pl-12 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-zinc-700 focus:bg-white/[0.06] focus:border-purple-500/40 focus:shadow-[0_0_25px_rgba(139,92,246,0.1)] transition-all duration-300 rounded-2xl"
                                    />
                                    <motion.div
                                        animate={{ scaleX: focusedField === 'identifier' ? 1 : 0 }}
                                        className="absolute bottom-0 left-4 right-4 h-px origin-left"
                                        style={{ background: "linear-gradient(90deg, #7c3aed, #ec4899, #06b6d4)" }}
                                    />
                                </div>
                            </div>

                            {/* Password field */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-1.5">
                                        <Shield className="w-3 h-3 text-cyan-400/60" />
                                        Access Token
                                    </Label>
                                    <Link href="/auth/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-pink-400/70 hover:text-pink-300 transition-colors relative group/forgot">
                                        Forgot?
                                        <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-pink-500 to-purple-500 scale-x-0 group-hover/forgot:scale-x-100 transition-transform origin-left" />
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'password' ? 'text-cyan-400' : 'text-zinc-600'}`}>
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        className="h-14 pl-12 pr-12 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-zinc-700 focus:bg-white/[0.06] focus:border-cyan-500/40 focus:shadow-[0_0_25px_rgba(6,182,212,0.1)] transition-all duration-300 rounded-2xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-cyan-400 transition-all duration-300 hover:scale-110"
                                        tabIndex={-1}
                                    >
                                        <AnimatePresence mode="wait">
                                            {showPassword ? (
                                                <motion.div key="off" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }} transition={{ duration: 0.2 }}>
                                                    <EyeOff className="w-4 h-4" />
                                                </motion.div>
                                            ) : (
                                                <motion.div key="on" initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -90 }} transition={{ duration: 0.2 }}>
                                                    <Eye className="w-4 h-4" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                    <motion.div
                                        animate={{ scaleX: focusedField === 'password' ? 1 : 0 }}
                                        className="absolute bottom-0 left-4 right-4 h-px origin-left"
                                        style={{ background: "linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899)" }}
                                    />
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-6 px-8 pb-10 pt-4">
                            <Button
                                className="w-full h-14 font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] group relative overflow-hidden transition-all duration-500 hover:-translate-y-0.5 border-0"
                                type="submit"
                                disabled={loading || loginSuccess}
                                style={{
                                    background: loginSuccess
                                        ? "linear-gradient(135deg, #10b981, #06b6d4)"
                                        : "linear-gradient(135deg, #7c3aed, #ec4899, #06b6d4)",
                                    boxShadow: loginSuccess
                                        ? "0 10px 40px rgba(16,185,129,0.3)"
                                        : "0 10px 40px rgba(139,92,246,0.3), 0 0 60px rgba(236,72,153,0.1)",
                                }}
                            >
                                {/* Animated shimmer */}
                                <motion.div
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent w-1/2"
                                />

                                <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                                    {loginSuccess ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            Access Granted
                                        </>
                                    ) : loading ? (
                                        <>
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                                <Zap className="w-4 h-4" />
                                            </motion.div>
                                            Authenticating...
                                        </>
                                    ) : (
                                        <>
                                            Login to Command Center
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </Button>

                            <div className="text-[11px] font-bold text-center text-zinc-500 tracking-wider">
                                New operative?{" "}
                                <Link href="/auth/signup" className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-pink-300 transition-all uppercase tracking-[0.1em] font-black">
                                    Initialize Account
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>

                {/* ── Bottom feature badges ── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-8 flex justify-center gap-6"
                >
                    {[
                        { icon: Sparkles, label: "AI Secured", color: "text-purple-400/50" },
                        { icon: Shield, label: "256-bit", color: "text-cyan-400/50" },
                        { icon: Wifi, label: "Live Sync", color: "text-pink-400/50" },
                    ].map(({ icon: Icon, label, color }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2 + i * 0.15 }}
                            className="flex items-center gap-1.5 text-zinc-600"
                        >
                            <Icon className={`w-3 h-3 ${color}`} />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    )
}
