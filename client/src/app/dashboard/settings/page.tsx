"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Shield, Settings, Bell, Lock, Eye, HelpCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

// Panels (we will create these next)
import ProfilePanel from "./components/ProfilePanel"
import SecurityPanel from "./components/SecurityPanel"
import PreferencesPanel from "./components/PreferencesPanel"
import NotificationsPanel from "./components/NotificationsPanel"
import PrivacyPanel from "./components/PrivacyPanel"
import AppearancePanel from "./components/AppearancePanel"
import HelpPanel from "./components/HelpPanel"
import MeshBackground from "../components/MeshBackground"
import HolographicHud from "@/components/ui/HolographicHud"
import TiltCard from "@/components/ui/TiltCard"
import { motion, AnimatePresence } from "framer-motion"
import BackToDashboard from "@/components/dashboard/BackToDashboard"

export default function SettingsPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("profile")
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const userStr = localStorage.getItem("user")
        if (!userStr) {
            router.push("/auth/login")
            return
        }
        setUser(JSON.parse(userStr))
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        router.push("/auth/login")
        toast.success("Logged out successfully")
    }

    const menuItems = [
        { id: "profile", label: "Profile Settings", icon: User },
        { id: "security", label: "Account & Security", icon: Shield },
        { id: "preferences", label: "Interview Preferences", icon: Settings },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "privacy", label: "Privacy & Data", icon: Lock },
        { id: "appearance", label: "Appearance", icon: Eye },
        { id: "help", label: "Help & Support", icon: HelpCircle },
    ]

    return (
        <div className="min-h-screen bg-transparent text-white p-3 sm:p-6 md:p-10 font-sans flex flex-col md:flex-row gap-4 md:gap-8 relative overflow-hidden aurora-glow">
            <MeshBackground />
            <HolographicHud />

            {/* Floating ambient orbs */}
            <div className="absolute top-24 left-12 w-80 h-80 bg-violet-500/5 rounded-full blur-[140px] orb-float pointer-events-none" />
            <div className="absolute bottom-20 right-16 w-72 h-72 bg-cyan-500/4 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '3s' }} />
            <Toaster position="top-right" theme="dark" />

            <BackToDashboard currentPage="Settings" />

            {/* Left Sidebar - Biometric Control Panel */}
            <aside className="w-64 shrink-0 hidden md:block space-y-8 relative z-10">
                <div className="relative group">
                    <h1 className="text-3xl font-black tracking-tighter mb-2 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent italic">Control Center</h1>
                    <p className="text-[10px] font-black text-violet-400/60 uppercase tracking-[0.2em]">Neural Configuration</p>
                    <div className="absolute -left-4 top-0 w-[2px] h-full bg-gradient-to-b from-violet-500/40 to-transparent" />
                </div>

                <nav className="space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest relative group ${activeTab === item.id
                                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_0_25px_rgba(139,92,246,0.2)]"
                                : "text-zinc-500 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <item.icon className={`w-4 h-4 ${activeTab === item.id ? "text-white" : "group-hover:text-violet-400 transition-colors"}`} />
                            {item.label}
                            {activeTab === item.id && (
                                <motion.div
                                    layoutId="settings-active"
                                    className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 -z-10 rounded-2xl"
                                />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="pt-8 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest text-red-500/70 hover:bg-red-500/10 hover:text-red-400 group"
                    >
                        <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        Terminate Session
                    </button>
                </div>
            </aside>

            {/* Mobile Tab Bar */}
            <div className="md:hidden flex overflow-x-auto gap-2 pb-2 -mx-1 px-1 scrollbar-hide relative z-10">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === item.id
                            ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                            : "text-zinc-500 bg-white/5 border border-white/5 hover:text-white"
                            }`}
                    >
                        <item.icon className="w-3.5 h-3.5" />
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Right Content Panel - Specialized HUD Container */}
            <main className="flex-1 bg-zinc-950/40 border border-white/10 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 backdrop-blur-2xl shadow-2xl overflow-hidden min-h-[400px] sm:min-h-[600px] relative z-10 group/content hover:border-violet-500/15 transition-all duration-300">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/content:opacity-10 transition-opacity pointer-events-none">
                    <Settings className="w-64 h-64 text-white rotate-12" />
                </div>

                <div className="relative flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center border border-violet-500/20">
                        <User className="text-violet-400 w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">{activeTab.replace("-", " ")}</h2>
                        <div className="h-[2px] w-12 bg-gradient-to-r from-violet-500 to-cyan-500 mt-1" />
                    </div>
                </div>

                {user ? (
                    <>
                        {activeTab === "profile" && <ProfilePanel user={user} />}
                        {activeTab === "security" && <SecurityPanel user={user} />}
                        {activeTab === "preferences" && <PreferencesPanel user={user} />}
                        {activeTab === "notifications" && <NotificationsPanel user={user} />}
                        {activeTab === "privacy" && <PrivacyPanel user={user} />}
                        {activeTab === "appearance" && <AppearancePanel user={user} />}
                        {activeTab === "help" && <HelpPanel user={user} />}
                    </>
                ) : (
                    <div className="text-zinc-500 italic">Loading user data...</div>
                )}
            </main>
        </div>
    )
}
