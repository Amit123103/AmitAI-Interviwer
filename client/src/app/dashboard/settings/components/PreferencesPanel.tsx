"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import axios from "axios"
import { Settings, Save, Loader2, Mic, Gauge, Languages } from "lucide-react"

export default function PreferencesPanel({ user }: { user: any }) {
    const [loading, setLoading] = useState(false)
    const [prefs, setPrefs] = useState({
        defaultVoice: user.preferences?.defaultVoice || "Female (Alloy)",
        defaultDifficulty: user.preferences?.defaultDifficulty || "Intermediate",
        defaultQuestionCount: user.preferences?.defaultQuestionCount || 10,
        language: user.preferences?.language || "English"
    })

    const handleSave = async () => {
        setLoading(true)
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/user/settings/preferences`,
                prefs,
                { headers: { Authorization: `Bearer ${user.token}` } }
            )
            toast.success("Preferences saved successfully")
            const newUser = { ...user, preferences: { ...user.preferences, ...prefs } }
            localStorage.setItem("user", JSON.stringify(newUser))
        } catch (err) {
            console.error("Error saving preferences:", err)
            toast.error("Failed to save preferences")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-zinc-950/80 border-white/[0.06] backdrop-blur-2xl hover:border-violet-500/20 hover:shadow-[0_0_40px_rgba(139,92,246,0.06)] transition-all duration-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-violet-400" />
                        <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Interview Defaults</span>
                    </CardTitle>
                    <CardDescription>Customize how your AI interviews start by default.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none text-zinc-300 hover:text-violet-400 transition-colors flex items-center gap-2"><Mic className="w-3 h-3 text-fuchsia-400" />Default Voice</label>
                        <Select value={prefs.defaultVoice} onValueChange={(val) => setPrefs({ ...prefs, defaultVoice: val })}>
                            <SelectTrigger className="bg-zinc-900/50 border-white/[0.06] focus:border-violet-500/40">
                                <SelectValue placeholder="Select voice" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Female (Alloy)">Female (Alloy) - Balanced</SelectItem>
                                <SelectItem value="Female (Emma)">Female (Emma) - Professional</SelectItem>
                                <SelectItem value="Male (Echo)">Male (Echo) - Deep</SelectItem>
                                <SelectItem value="Male (Ryan)">Male (Ryan) - Authoritative</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none text-zinc-300 hover:text-violet-400 transition-colors flex items-center gap-2"><Gauge className="w-3 h-3 text-cyan-400" />Default Difficulty</label>
                        <Select value={prefs.defaultDifficulty} onValueChange={(val) => setPrefs({ ...prefs, defaultDifficulty: val })}>
                            <SelectTrigger className="bg-zinc-900/50 border-white/[0.06] focus:border-violet-500/40">
                                <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Easy">Easy - Fundamental Concepts</SelectItem>
                                <SelectItem value="Intermediate">Intermediate - Standard Industry Level</SelectItem>
                                <SelectItem value="Advanced">Advanced - Senior/Lead Roles</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-4">
                        <div className="flex justify-between">
                            <label className="text-sm font-medium leading-none text-zinc-300">Questions per Session</label>
                            <span className="text-sm font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{prefs.defaultQuestionCount} Questions</span>
                        </div>
                        <Slider
                            defaultValue={[prefs.defaultQuestionCount]}
                            max={20}
                            min={3}
                            step={1}
                            onValueChange={(val) => setPrefs({ ...prefs, defaultQuestionCount: val[0] })}
                            className="py-4"
                        />
                        <p className="text-xs text-zinc-500">More questions = longer, more in-depth sessions.</p>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none text-zinc-300 hover:text-violet-400 transition-colors flex items-center gap-2"><Languages className="w-3 h-3 text-emerald-400" />Interview Language</label>
                        <Select value={prefs.language} onValueChange={(val) => setPrefs({ ...prefs, language: val })}>
                            <SelectTrigger className="bg-zinc-900/50 border-white/[0.06] focus:border-violet-500/40">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="English">English (US)</SelectItem>
                                <SelectItem value="Hindi">Hindi (Beta)</SelectItem>
                                <SelectItem value="Spanish">Spanish (Coming Soon)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={loading} className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-500 text-white font-bold px-8 shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all duration-300 border-0">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Preferences
                </Button>
            </div>
        </div>
    )
}
