"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import axios from "axios"
import { Lock, Download, Trash2, Loader2, AlertTriangle, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PrivacyPanel({ user }: { user: any }) {
    const router = useRouter()
    const [downloading, setDownloading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [deletePassword, setDeletePassword] = useState("")

    const handleDownload = async () => {
        setDownloading(true)
        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/user/settings/download`,
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                    responseType: 'blob'
                }
            )

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `my_data.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => window.URL.revokeObjectURL(url), 100);

            toast.success("Data downloaded successfully")
        } catch (err) {
            console.error("Error downloading data:", err)
            toast.error("Failed to download data")
        } finally {
            setDownloading(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (!deletePassword) return
        setDeleting(true)
        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/user/settings/account`,
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                    data: { password: deletePassword }
                }
            )
            toast.success("Account deleted. Goodbye!")
            localStorage.clear()
            router.push("/")
        } catch (err: any) {
            console.error("Error deleting account:", err)
            toast.error(err.response?.data?.message || "Failed to delete account")
            setDeleting(false)
        }
    }

    return (
        <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-zinc-950/80 border-white/[0.06] backdrop-blur-2xl hover:border-violet-500/20 hover:shadow-[0_0_40px_rgba(139,92,246,0.06)] transition-all duration-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-violet-400" />
                        <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Data Privacy</span>
                    </CardTitle>
                    <CardDescription>Manage your personal data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/10 hover:border-cyan-500/25 transition-colors">
                        <div className="space-y-1">
                            <h3 className="font-bold text-white flex items-center gap-2"><Download className="w-4 h-4 text-cyan-400" />Download My Data</h3>
                            <p className="text-sm text-zinc-500">Get a copy of your profile, interview history, and reports.</p>
                        </div>
                        <Button variant="outline" onClick={handleDownload} disabled={downloading} className="border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/10 text-cyan-400">
                            {downloading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                            Download ZIP
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-red-950/10 border-red-500/15 hover:border-red-500/30 hover:shadow-[0_0_40px_rgba(239,68,68,0.08)] transition-all duration-500 backdrop-blur-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-500">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Danger Zone</span>
                    </CardTitle>
                    <CardDescription className="text-red-200/60">Irreversible actions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="font-bold text-red-400">Delete Account</h3>
                            <p className="text-sm text-red-200/50">Permanently remove your account and all data.</p>
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="bg-red-600 hover:bg-red-700 shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all">
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-zinc-950 border-red-500/20 text-white backdrop-blur-2xl">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-red-400">Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your
                                        account and remove your data from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4">
                                    <label className="text-sm text-zinc-400 mb-2 block">Confirm Password</label>
                                    <Input
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        className="bg-black border-red-500/20 focus:border-red-500/40"
                                        placeholder="Enter your password to confirm"
                                    />
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeleteAccount}
                                        disabled={!deletePassword || deleting}
                                        className="bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                                    >
                                        {deleting ? "Deleting..." : "Permanently Delete"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
