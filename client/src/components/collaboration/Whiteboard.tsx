import React from 'react'
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

interface WhiteboardProps {
    roomId: string
    // In a real implementation, we would pass store persistence handlers here
}

export default function Whiteboard({ roomId }: WhiteboardProps) {
    return (
        <div className="w-full h-full relative" style={{ isolation: 'isolate' }}>
            {/* Tldraw provides its own infinite canvas and tools */}
            <Tldraw persistenceKey={`room-${roomId}`} />
        </div>
    )
}
