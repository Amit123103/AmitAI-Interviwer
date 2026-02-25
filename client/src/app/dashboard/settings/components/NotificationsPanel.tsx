"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import axios from "axios"
import { Bell, Save, Loader2, Mail, Clock, Zap } from "lucide-react"

export default function NotificationsPanel({ user }: { user: any }) {
    const [loading, setLoading] = useState(false)
    const [notifs, setNotifs] = useState({
        email: user.preferences?.notifications?.email ?? true,
        reminders: user.preferences?.notifications?.reminders ?? true,
        updates: user.preferences?.notifications?.updates ?? true
    })

    const handleSave = async () => {
        setLoading(true)
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/user/settings/notifications`,
                notifs,
                { headers: { Authorization: `Bearer ${user.token}` } }
            )
            toast.success("Notification settings saved")
            const newUser = {
                ...user,
                preferences: {
                    ...user.preferences,
                    notifications: notifs
                }
            }
            localStorage.setItem("user", JSON.stringify(newUser))
        } catch (err) {
            console.error("Error saving notifications:", err)
            toast.error("Failed to save settings")
        } finally {
            setLoading(false)
        }
    }

    const ToggleItem = ({ label, desc, checked, onChange, icon: Icon, color }: any) => (
        <div className={`flex items-center justify-between py-4 px-4 -mx-4 rounded-xl border border-transparent hover:border-${color}-500/10 hover:bg-${color}-500/5 transition-all duration-300 border-b border-zinc-800/50 last:border-0`}>
            <div className="space-y-0.5 flex items-center gap-3">
                <Icon className={`w-4 h-4 text-${color}-400`} />
                <div>
                    <label className="text-base font-medium text-white">{label}</label>
                    <p className="text-sm text-zinc-500">{desc}</p>
                </div>
            </div>
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    )

    return (
        <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-zinc-950/80 border-white/[0.06] backdrop-blur-2xl hover:border-violet-500/20 hover:shadow-[0_0_40px_rgba(139,92,246,0.06)] transition-all duration-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-amber-400" />
                        <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-fuchsia-400 bg-clip-text text-transparent">Notification Preferences</span>
                    </CardTitle>
                    <CardDescription>Control how you want to be notified.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ToggleItem
                        label="Email Notifications"
                        desc="Receive interview summaries and weekly reports via email."
                        checked={notifs.email}
                        onChange={(v: boolean) => setNotifs({ ...notifs, email: v })}
                        icon={Mail}
                        color="violet"
                    />
                    <ToggleItem
                        label="Interview Reminders"
                        desc="Get reminded 1 hour before scheduled mock interviews."
                        checked={notifs.reminders}
                        onChange={(v: boolean) => setNotifs({ ...notifs, reminders: v })}
                        icon={Clock}
                        color="cyan"
                    />
                    <ToggleItem
                        label="Product Updates & Tips"
                        desc="Stay updated with new features and interview tips."
                        checked={notifs.updates}
                        onChange={(v: boolean) => setNotifs({ ...notifs, updates: v })}
                        icon={Zap}
                        color="fuchsia"
                    />
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={loading} className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-500 text-white font-bold px-8 shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all duration-300 border-0">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                </Button>
            </div>
        </div>
    )
}
