import React, { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Mic, MicOff, Video, VideoOff } from 'lucide-react'

interface VideoGridProps {
    localStream: MediaStream | null
    peers: { userId: string, stream: MediaStream }[]
    isMuted: boolean
    isVideoOff: boolean
    onToggleMute: () => void
    onToggleVideo: () => void
}

const VideoPlayer = ({ stream, isLocal = false }: { stream: MediaStream, isLocal?: boolean }) => {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream
        }
    }, [stream])

    return (
        <div className="relative w-full h-full bg-zinc-900 rounded-xl overflow-hidden group">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isLocal} // Mute local video to prevent feedback
                className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`} // Mirror local video
            />
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                {isLocal ? 'You' : 'Peer'}
            </div>
        </div>
    )
}

export default function VideoGrid({ localStream, peers, isMuted, isVideoOff, onToggleMute, onToggleVideo }: VideoGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 h-full">
            {/* Local Video */}
            <div className="relative aspect-video">
                {localStream ? (
                    <VideoPlayer stream={localStream} isLocal />
                ) : (
                    <div className="w-full h-full bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
                        Camera Off
                    </div>
                )}

                {/* Controls Overlay */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    <button
                        onClick={onToggleMute}
                        className={`p-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={onToggleVideo}
                        className={`p-2 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                        {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Remote Peers */}
            {peers.map((peer) => (
                <div key={peer.userId} className="relative aspect-video">
                    <VideoPlayer stream={peer.stream} />
                </div>
            ))}
        </div>
    )
}
