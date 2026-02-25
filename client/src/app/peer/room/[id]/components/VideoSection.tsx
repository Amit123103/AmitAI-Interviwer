"use client"

import React, { useEffect, useRef, useState } from "react"
import SimplePeer from "simple-peer"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff } from "lucide-react"
import { socket } from "@/lib/socket"

interface VideoSectionProps {
    roomId: string
    userId: string // Socket ID
    peers: string[] // List of other socket IDs in room
}

export default function VideoSection({ roomId, userId, peers }: VideoSectionProps) {
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [muted, setMuted] = useState(false)
    const [videoOff, setVideoOff] = useState(false)
    const userVideo = useRef<HTMLVideoElement>(null)
    const peersRef = useRef<{ peerID: string; peer: SimplePeer.Instance }[]>([])
    const [remoteStreams, setRemoteStreams] = useState<{ peerID: string; stream: MediaStream }[]>([])

    // Initialize User Media
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(currentStream => {
                setStream(currentStream)
                if (userVideo.current) {
                    userVideo.current.srcObject = currentStream
                }

                // If peers exist (I joined late), initiate calls
                if (peers.length > 0) {
                    peers.forEach(peerID => {
                        const peer = createPeer(peerID, socket.id!, currentStream)
                        peersRef.current.push({ peerID, peer })
                    })
                }
            })
            .catch(err => console.error("Error accessing media devices:", err))

        // Listen for signals (Offer/Answer/Candidate)
        socket.on("signal", (data: { from: string; signal: any }) => {
            const item = peersRef.current.find(p => p.peerID === data.from)
            if (item) {
                // Existing peer (I initiated, receiving Answer)
                item.peer.signal(data.signal)
            } else {
                // New peer (They initiated, receiving Offer)
                // Wait for my stream to be ready if not already
                if (stream) {
                    const peer = addPeer(data.signal, data.from, stream)
                    peersRef.current.push({ peerID: data.from, peer })
                } else {
                    // Need to handle race condition where stream isn't ready yet
                    // For MVP, simplistic check. In prod, queue signals.
                    console.warn("Received signal but stream not ready")
                }
            }
        })

        socket.on("user-disconnected", (id: string) => {
            const peerObj = peersRef.current.find(p => p.peerID === id)
            if (peerObj) peerObj.peer.destroy()
            peersRef.current = peersRef.current.filter(p => p.peerID !== id)
            setRemoteStreams(prev => prev.filter(p => p.peerID !== id))
        })

        return () => {
            // Cleanup
            socket.off("signal")
            socket.off("user-disconnected")
            // Don't stop tracks here to avoid killing reused stream, or do if strictly scoped
            // stream?.getTracks().forEach(track => track.stop())
        }
    }, [peers, roomId]) // Re-run if peers list changes? Carefully managed by socket events usually

    // Helper: Create Peer (Initiator)
    function createPeer(userToSignal: string, callerID: string, stream: MediaStream) {
        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socket.emit("signal", { to: userToSignal, signal })
        })

        peer.on("stream", remoteStream => {
            setRemoteStreams(prev => {
                if (prev.find(p => p.peerID === userToSignal)) return prev
                return [...prev, { peerID: userToSignal, stream: remoteStream }]
            })
        })

        return peer
    }

    // Helper: Add Peer (Receiver)
    function addPeer(incomingSignal: any, callerID: string, stream: MediaStream) {
        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socket.emit("signal", { to: callerID, signal })
        })

        peer.on("stream", remoteStream => {
            setRemoteStreams(prev => {
                if (prev.find(p => p.peerID === callerID)) return prev
                return [...prev, { peerID: callerID, stream: remoteStream }]
            })
        })

        peer.signal(incomingSignal)
        return peer
    }


    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled
            setMuted(!muted)
        }
    }

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled
            setVideoOff(!videoOff)
        }
    }

    return (
        <div className="flex flex-col gap-4 h-full bg-zinc-900 rounded-2xl p-4 overflow-hidden">
            {/* Local Video */}
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video border border-zinc-800 group">
                <video ref={userVideo} muted autoPlay playsInline className="w-full h-full object-cover mirror" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant={muted ? "destructive" : "secondary"} className="rounded-full w-10 h-10" onClick={toggleMute}>
                        {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    <Button size="icon" variant={videoOff ? "destructive" : "secondary"} className="rounded-full w-10 h-10" onClick={toggleVideo}>
                        {videoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    </Button>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs">You</div>
            </div>

            {/* Remote Videos */}
            <div className="flex-1 overflow-y-auto space-y-4">
                {remoteStreams.map(remote => (
                    <RemoteVideo key={remote.peerID} stream={remote.stream} peerID={remote.peerID} />
                ))}
                {remoteStreams.length === 0 && (
                    <div className="h-full flex items-center justify-center text-zinc-500 text-sm italic">
                        Waiting for peer...
                    </div>
                )}
            </div>
        </div>
    )
}

const RemoteVideo = ({ stream, peerID }: { stream: MediaStream; peerID: string }) => {
    const ref = useRef<HTMLVideoElement>(null)
    useEffect(() => {
        if (ref.current) ref.current.srcObject = stream
    }, [stream])

    return (
        <div className="relative bg-black rounded-xl overflow-hidden aspect-video border border-zinc-700">
            <video ref={ref} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs">Peer {peerID.slice(0, 4)}</div>
        </div>
    )
}
