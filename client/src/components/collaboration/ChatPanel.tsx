import React, { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, User } from 'lucide-react'

interface Message {
    sender: string
    text: string
    timestamp: number
    isSelf: boolean
}

interface ChatPanelProps {
    messages: Message[]
    onSendMessage: (text: string) => void
}

export default function ChatPanel({ messages, onSendMessage }: ChatPanelProps) {
    const [newMessage, setNewMessage] = useState('')
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault()
        if (newMessage.trim()) {
            onSendMessage(newMessage)
            setNewMessage('')
        }
    }

    return (
        <Card className="flex flex-col h-full bg-zinc-900 border-zinc-800">
            <div className="p-3 border-b border-zinc-800 font-bold text-sm">
                Meeting Chat
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] rounded-xl p-3 text-sm ${msg.isSelf
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-zinc-800 text-zinc-200 rounded-bl-none'
                            }`}>
                            {msg.text}
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-1">
                            {msg.sender} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-zinc-800 flex gap-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="bg-black border-zinc-700"
                />
                <Button type="submit" size="icon" className="shrink-0 bg-indigo-600 hover:bg-indigo-500">
                    <Send className="w-4 h-4" />
                </Button>
            </form>
        </Card>
    )
}
