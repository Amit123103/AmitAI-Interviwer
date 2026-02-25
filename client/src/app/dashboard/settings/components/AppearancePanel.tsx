"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Eye, Moon, Sun, Smartphone, Palette } from "lucide-react"

export default function AppearancePanel({ user }: { user: any }) {
    const [theme, setTheme] = useState(user.preferences?.theme || "dark")

    return (
        <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-zinc-950/80 border-white/[0.06] backdrop-blur-2xl hover:border-violet-500/20 hover:shadow-[0_0_40px_rgba(139,92,246,0.06)] transition-all duration-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-fuchsia-400" />
                        <span className="bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">Appearance</span>
                    </CardTitle>
                    <CardDescription>Customize the interface look and feel.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${theme === 'dark' ? 'border-violet-500 bg-violet-500/10 shadow-[0_0_25px_rgba(139,92,246,0.2)]' : 'border-white/[0.06] bg-black hover:border-white/10'}`}
                            onClick={() => setTheme('dark')}
                        >
                            <div className="flex justify-center mb-3">
                                <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-violet-400' : 'text-white'}`} />
                            </div>
                            <p className={`text-center font-bold text-sm ${theme === 'dark' ? 'bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent' : ''}`}>Dark Mode</p>
                        </div>
                        <div
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${theme === 'light' ? 'border-violet-500 bg-violet-500/10' : 'border-white/[0.06] bg-black hover:border-white/10 opacity-50'}`}
                        >
                            <div className="flex justify-center mb-3">
                                <Sun className="w-6 h-6 text-zinc-400" />
                            </div>
                            <p className="text-center font-bold text-sm text-zinc-400">Light Mode (Soon)</p>
                        </div>
                        <div
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${theme === 'system' ? 'border-violet-500 bg-violet-500/10' : 'border-white/[0.06] bg-black hover:border-white/10 opacity-50'}`}
                        >
                            <div className="flex justify-center mb-3">
                                <Smartphone className="w-6 h-6 text-zinc-400" />
                            </div>
                            <p className="text-center font-bold text-sm text-zinc-400">System (Soon)</p>
                        </div>
                    </div>

                    <p className="text-xs text-zinc-500 text-center">
                        * Currently, the platform is optimized for Dark Mode only. Light mode is coming in V2.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
