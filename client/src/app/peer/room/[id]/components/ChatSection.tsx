"use client"

import React, { useEffect, useState, useRef } from "react"
import { socket } from "@/lib/socket"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, User, MessageSquare } from "lucide-react"

interface ChatSectionProps {
    roomId: string
    userId: string
}

interface Message {
    sender: string
    message: string
    timestamp: Date
    isMe: boolean
}

export default function ChatSection({ roomId, userId }: ChatSectionProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        socket.on("chat-message", (data: { message: string; sender: string; timestamp: string }) => {
            setMessages(prev => [...prev, {
                sender: data.sender,
                message: data.message,
                timestamp: new Date(data.timestamp),
                isMe: data.sender === userId
            }])
        })

        return () => {
            socket.off("chat-message")
        }
    }, [userId])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const sendMessage = () => {
        if (!input.trim()) return

        // Optimistic update
        const newMessage: Message = {
            sender: userId,
            message: input,
            timestamp: new Date(),
            isMe: true
        }
        setMessages(prev => [...prev, newMessage])

        socket.emit("chat-message", { roomId, message: input, sender: userId })
        setInput("")
    }

    return (
        <div className="flex flex-col h-full bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
            <div className="p-3 border-b border-zinc-800 bg-zinc-950">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Session Chat</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.isMe ? 'bg-primary text-white font-medium rounded-tr-none' : 'bg-zinc-800 text-zinc-200 rounded-tl-none'
                            }`}>
                            <p>{msg.message}</p>
                            <p className={`text-[10px] mt-1 ${msg.isMe ? 'text-black/50' : 'text-zinc-500'} flex items-center gap-1`}>
                                <User className="w-2.5 h-2.5 text-white" />
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="bg-zinc-900 border-zinc-800 h-10"
                />
                <Button size="icon" onClick={sendMessage} className="h-10 w-10 shrink-0">
                    <MessageSquare className="w-2.5 h-2.5 text-white" />
                </Button>
            </div>
        </div>
    )
}
