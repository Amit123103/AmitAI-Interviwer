"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import axios from "axios"
import { Camera, Save, Loader2, User, Sparkles } from "lucide-react"

export default function ProfilePanel({ user }: { user: any }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: "",
        course: "",
        department: "",
        dreamCompany: "",
        bio: "",
        profilePhoto: ""
    })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/profile`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                })
                setFormData(prev => ({
                    ...prev,
                    ...res.data,
                    fullName: res.data.fullName || "",
                    course: res.data.course || "",
                    department: res.data.department || "",
                    dreamCompany: res.data.dreamCompany || "",
                    bio: res.data.bio || "",
                    profilePhoto: res.data.profilePhoto || ""
                }))
            } catch (err) {
                console.error("Error fetching profile:", err)
            }
        }
        if (user) fetchProfile()
    }, [user])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const data = new FormData()
            data.append("fullName", formData.fullName)
            data.append("course", formData.course)
            data.append("department", formData.department)
            data.append("dreamCompany", formData.dreamCompany)
            if (formData.bio) data.append("bio", formData.bio)

            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/profile`,
                data,
                { headers: { Authorization: `Bearer ${user.token}` } }
            )

            toast.success("Profile updated successfully")
        } catch (err) {
            console.error("Error updating profile:", err)
            toast.error("Failed to update profile")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-zinc-950/80 border-white/[0.06] backdrop-blur-2xl hover:border-violet-500/20 hover:shadow-[0_0_40px_rgba(139,92,246,0.06)] transition-all duration-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-violet-400" />
                        <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Public Profile</span>
                    </CardTitle>
                    <CardDescription>This information will be displayed on your public profile.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Photo Placeholder */}
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-zinc-800/50 flex items-center justify-center border-2 border-dashed border-violet-500/30 relative overflow-hidden group hover:border-violet-500/50 transition-colors">
                            {formData.profilePhoto ? (
                                <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <Camera className="w-8 h-8 text-violet-400/50" />
                            )}
                            <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer">
                                <span className="text-xs font-bold text-white">Change</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold">Profile Photo</h3>
                            <p className="text-xs text-zinc-500">JPG, GIF or PNG. Max 1MB.</p>
                            <Button variant="outline" size="sm" className="mt-2 h-8 border-violet-500/20 hover:border-violet-500/40 hover:bg-violet-500/10 text-violet-400">Upload New</Button>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none text-zinc-300 hover:text-violet-400 transition-colors">Full Name</label>
                            <Input
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="bg-zinc-900/50 border-white/[0.06] focus:border-violet-500/40 focus:ring-violet-500/20"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none text-zinc-300 hover:text-violet-400 transition-colors">Bio</label>
                            <Textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="I am a passionate software engineer..."
                                className="bg-zinc-900/50 border-white/[0.06] min-h-[100px] focus:border-violet-500/40 focus:ring-violet-500/20"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-zinc-950/80 border-white/[0.06] backdrop-blur-2xl hover:border-violet-500/20 hover:shadow-[0_0_40px_rgba(139,92,246,0.06)] transition-all duration-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-fuchsia-400" />
                        <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">Academic & Career</span>
                    </CardTitle>
                    <CardDescription>Tailor your interview experience.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none text-zinc-300 hover:text-violet-400 transition-colors">Course / Major</label>
                            <Input
                                name="course"
                                value={formData.course}
                                onChange={handleChange}
                                placeholder="Computer Science"
                                className="bg-zinc-900/50 border-white/[0.06] focus:border-violet-500/40 focus:ring-violet-500/20"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none text-zinc-300 hover:text-violet-400 transition-colors">Department</label>
                            <Input
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                placeholder="Engineering"
                                className="bg-zinc-900/50 border-white/[0.06] focus:border-violet-500/40 focus:ring-violet-500/20"
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none text-zinc-300 hover:text-violet-400 transition-colors">Dream Company</label>
                        <Input
                            name="dreamCompany"
                            value={formData.dreamCompany}
                            onChange={handleChange}
                            placeholder="Google, Amazon, etc."
                            className="bg-zinc-900/50 border-white/[0.06] focus:border-violet-500/40 focus:ring-violet-500/20"
                        />
                    </div>
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
