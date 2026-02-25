"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Video, Code2, Copy, Check } from "lucide-react"

export default function PeerLobbyPage() {
    const router = useRouter()
    const [generatedLink, setGeneratedLink] = useState("")
    const [copied, setCopied] = useState(false)

    const handleCreateRoom = () => {
        // Generate a random room ID
        const roomId = Math.random().toString(36).substring(7)
        router.push(`/peer/room/${roomId}`)
    }

    const handleCopyLink = () => {
        // In a real app, this would be the actual public URL
        const url = `${window.location.origin}/peer/room/${Math.random().toString(36).substring(7)}`
        setGeneratedLink(url)
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-10 flex flex-col items-center justify-center">
            <div className="max-w-2xl w-full space-y-6 sm:space-y-8">
                <div className="text-center space-y-3 sm:space-y-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                        <Users className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Peer Mock Interview</h1>
                    <p className="text-zinc-400 text-sm sm:text-base md:text-lg">
                        Practice with a friend or colleague in real-time. Share code, chat, and simulate a real interview environment.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-zinc-900 border-zinc-800 hover:border-primary/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Video className="text-green-500" /> Start Session
                            </CardTitle>
                            <CardDescription className="text-zinc-500">
                                Create a new room and jump straight in.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full font-bold" onClick={handleCreateRoom}>
                                Create Room
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800 hover:border-primary/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Code2 className="text-blue-500" /> Invite Friend
                            </CardTitle>
                            <CardDescription className="text-zinc-500">
                                Generate a link to share.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800" onClick={handleCopyLink}>
                                {copied ? <Check className="mr-2 w-4 h-4 text-green-500" /> : <Copy className="mr-2 w-4 h-4" />}
                                {copied ? "Link Copied" : "Generate Invite Link"}
                            </Button>
                            {generatedLink && (
                                <p className="text-xs text-zinc-600 break-all text-center">{generatedLink}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="text-center text-zinc-500 text-sm">
                    <p>Note: Peer connections use shared sockets. Ensure both users are online.</p>
                </div>
            </div>
        </div>
    )
}
