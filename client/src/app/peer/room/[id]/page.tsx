"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation" // Correct import for App Router
import { socket } from "@/lib/socket"
import VideoSection from "./components/VideoSection"
import CodeEditorSection from "./components/CodeEditorSection"
import ChatSection from "./components/ChatSection"
import { Button } from "@/components/ui/button"
import { Copy, Check, LogOut, Users } from "lucide-react"
import { toast } from "sonner"

export default function RoomPage() {
    // useParams returns string or string[]
    const params = useParams()
    const router = useRouter()
    // safely handle params.id
    const roomId = Array.isArray(params?.id) ? params.id[0] : params?.id as string

    const [isConnected, setIsConnected] = useState(false)
    const [peers, setPeers] = useState<string[]>([])
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!roomId) return

        if (!socket.connected) {
            socket.io.opts.query = { roomId } // Pass roomId on connection if needed
            socket.connect()
        }

        // Join the room
        socket.emit("join-room", roomId, socket.id)

        socket.on("connect", () => {
            setIsConnected(true)
        })

        // Listen for existing peers (from server)
        socket.on("existing-peers", (existingPeers: string[]) => {
            console.log("Existing peers:", existingPeers)
            setPeers(existingPeers)
        })

        // Listen for new peer joining
        socket.on("peer-connected", (data: { peerId: string }) => {
            console.log("Peer connected:", data.peerId)
            setPeers(prev => [...prev, data.peerId])
            toast.success("A peer has joined the room!")
        })

        // Listen for peer disconnecting
        socket.on("user-disconnected", (id: string) => {
            setPeers(prev => prev.filter(p => p !== id))
            toast.info("Peer disconnected")
        })

        return () => {
            socket.off("connect")
            socket.off("existing-peers")
            socket.off("peer-connected")
            socket.off("user-disconnected")
            // Don't disconnect socket globally if used elsewhere, but ideally clean up listeners
        }
    }, [roomId])

    const copyLink = () => {
        const url = window.location.href
        navigator.clipboard.writeText(url)
        setCopied(true)
        toast.success("Room link copied to clipboard")
        setTimeout(() => setCopied(false), 2000)
    }

    const leaveRoom = () => {
        router.push("/peer")
    }

    if (!roomId) return <div className="text-white">Invalid Room ID</div>

    if (!isConnected) {
        return (
            <div className="h-screen bg-black text-white flex items-center justify-center flex-col gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="text-zinc-500 animate-pulse">Connecting to room...</p>
            </div>
        )
    }

    return (
        <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary rounded flex items-center justify-center font-bold text-black">
                        P2P
                    </div>
                    <div>
                        <h1 className="font-bold text-sm">Peer Interview Room</h1>
                        <p className="text-xs text-zinc-500 font-mono">ID: {roomId}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">
                        <Users className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs font-bold">{peers.length + 1} Online</span>
                    </div>

                    <Button variant="outline" size="sm" onClick={copyLink} className="gap-2 border-zinc-800">
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied" : "Copy Link"}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={leaveRoom}>
                        <LogOut className="w-4 h-4 mr-2" /> Leave
                    </Button>
                </div>
            </header>

            {/* Main Content Grid */}
            <main className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
                {/* Left Panel: Video & Chat (3 cols) */}
                <div className="col-span-3 flex flex-col border-r border-zinc-800 bg-zinc-950/50">
                    <div className="h-1/2 p-4 border-b border-zinc-800">
                        {/* socket.id is guaranteed here because isConnected is true */}
                        <VideoSection roomId={roomId} userId={socket.id!} peers={peers} />
                    </div>
                    <div className="h-1/2 p-4">
                        <ChatSection roomId={roomId} userId={socket.id!} />
                    </div>
                </div>

                {/* Right Panel: Code Editor (9 cols) */}
                <div className="col-span-9 bg-[#1e1e1e]">
                    <CodeEditorSection roomId={roomId} />
                </div>
            </main>
        </div>
    )
}
