"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import axios from "axios"
import { ShieldCheck, Loader2, Lock, Fingerprint, Eye, EyeOff, KeyRound, Shield } from "lucide-react"
import { motion } from "framer-motion"

export default function SecurityPanel({ user }: { user: any }) {
    const [loading, setLoading] = useState(false)
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    })
    const [twoFactor, setTwoFactor] = useState(user.twoFactorEnabled || false)

    const handlePasswordChange = async () => {
        if (passwords.new !== passwords.confirm) {
            toast.error("New passwords do not match")
            return
        }
        if (passwords.new.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setLoading(true)
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/user/settings/security/password`,
                { currentPassword: passwords.current, newPassword: passwords.new },
                { headers: { Authorization: `Bearer ${user.token}` } }
            )
            toast.success("Password updated successfully")
            setPasswords({ current: "", new: "", confirm: "" })
        } catch (err: any) {
            console.error("Error changing password:", err)
            toast.error(err.response?.data?.message || "Failed to update password")
        } finally {
            setLoading(false)
        }
    }

    const toggle2FA = async (checked: boolean) => {
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/user/settings/security/2fa`,
                { enabled: checked },
                { headers: { Authorization: `Bearer ${user.token}` } }
            )
            setTwoFactor(checked)
            toast.success(checked ? "2FA Enabled" : "2FA Disabled")
        } catch (err) {
            console.error("Error toggling 2FA:", err)
            toast.error("Failed to update 2FA settings")
        }
    }

    // Password strength indicator
    const getStrength = (pw: string) => {
        let s = 0
        if (pw.length >= 6) s++
        if (pw.length >= 10) s++
        if (/[A-Z]/.test(pw)) s++
        if (/[0-9]/.test(pw)) s++
        if (/[^A-Za-z0-9]/.test(pw)) s++
        return s
    }
    const strength = getStrength(passwords.new)
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent']
    const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-cyan-500']

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-2xl"
        >
            {/* Password Card */}
            <Card className="bg-zinc-900/40 backdrop-blur-2xl border-white/[0.06] hover:border-emerald-500/15 hover:shadow-[0_0_30px_rgba(16,185,129,0.06)] transition-all duration-500 rounded-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 flex items-center justify-center border border-emerald-500/15 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent font-black tracking-tight">Password & Authentication</span>
                    </CardTitle>
                    <CardDescription className="text-zinc-500 text-xs ml-12">Manage your login credentials and security layers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                    <div className="space-y-4 border-b border-white/[0.06] pb-6 mb-4">
                        {/* Current Password */}
                        <div className="grid gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 flex items-center gap-2">
                                <Lock className="w-3 h-3 text-zinc-600" /> Current Password
                            </label>
                            <div className="relative">
                                <Input
                                    type={showCurrent ? "text" : "password"}
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                    placeholder="••••••••"
                                    className="bg-black/30 border-white/[0.06] focus:border-emerald-500/30 focus:ring-emerald-500/10 rounded-xl pr-10 transition-colors"
                                />
                                <button
                                    onClick={() => setShowCurrent(!showCurrent)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                                >
                                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="grid gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 flex items-center gap-2">
                                <KeyRound className="w-3 h-3 text-zinc-600" /> New Password
                            </label>
                            <div className="relative">
                                <Input
                                    type={showNew ? "text" : "password"}
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                    placeholder="••••••••"
                                    className="bg-black/30 border-white/[0.06] focus:border-emerald-500/30 focus:ring-emerald-500/10 rounded-xl pr-10 transition-colors"
                                />
                                <button
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                                >
                                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {/* Strength meter */}
                            {passwords.new.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-1.5"
                                >
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(level => (
                                            <div
                                                key={level}
                                                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${strength >= level ? strengthColors[strength] : 'bg-zinc-800'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${strength <= 1 ? 'text-red-400' : strength <= 2 ? 'text-orange-400' : strength <= 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {strengthLabels[strength]}
                                    </span>
                                </motion.div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="grid gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500">Confirm New Password</label>
                            <div className="relative">
                                <Input
                                    type={showConfirm ? "text" : "password"}
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                    placeholder="••••••••"
                                    className={`bg-black/30 border-white/[0.06] rounded-xl pr-10 transition-colors ${passwords.confirm && passwords.confirm === passwords.new
                                        ? 'focus:border-emerald-500/30 border-emerald-500/20'
                                        : passwords.confirm
                                            ? 'focus:border-red-500/30 border-red-500/20'
                                            : 'focus:border-emerald-500/30'
                                        }`}
                                />
                                <button
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                                >
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            onClick={handlePasswordChange}
                            disabled={loading || !passwords.current || !passwords.new}
                            className="w-full bg-gradient-to-r from-emerald-600 via-cyan-600 to-violet-600 hover:from-emerald-500 hover:via-cyan-500 hover:to-violet-500 text-white font-black shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_35px_rgba(16,185,129,0.35)] transition-all duration-300 border-0 uppercase tracking-widest text-[10px] rounded-xl h-11"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Update Password
                        </Button>
                    </div>

                    {/* 2FA Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 rounded-xl border border-violet-500/10 hover:border-violet-500/20 transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/15 group-hover:shadow-[0_0_12px_rgba(139,92,246,0.15)] transition-all">
                                <Fingerprint className="w-4 h-4 text-violet-400" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white">Two-Factor Authentication</label>
                                <p className="text-[10px] text-zinc-500 mt-0.5">Add an extra layer of security to your account.</p>
                            </div>
                        </div>
                        <Switch checked={twoFactor} onCheckedChange={toggle2FA} />
                    </div>

                    {/* Security score */}
                    <div className="p-4 bg-zinc-900/40 rounded-xl border border-white/[0.04]">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-600 flex items-center gap-2">
                                <Shield className="w-3 h-3" /> Security Level
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${twoFactor ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {twoFactor ? 'Maximum' : 'Standard'}
                            </span>
                        </div>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4].map(level => (
                                <div
                                    key={level}
                                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${level <= (twoFactor ? 4 : 2)
                                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]'
                                        : 'bg-zinc-800'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
