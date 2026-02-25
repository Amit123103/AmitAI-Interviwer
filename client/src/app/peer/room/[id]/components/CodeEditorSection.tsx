"use client"

import React, { useEffect, useState, useRef } from "react"
import Editor from "@monaco-editor/react"
import { socket } from "@/lib/socket"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CodeEditorSectionProps {
    roomId: string
}

export default function CodeEditorSection({ roomId }: CodeEditorSectionProps) {
    const [code, setCode] = useState("// Start coding here...")
    const [language, setLanguage] = useState("javascript")
    const isRemoteUpdate = useRef(false)

    useEffect(() => {
        // Listen for code changes from peer
        socket.on("code-change", (newCode: string) => {
            isRemoteUpdate.current = true
            setCode(newCode)
            // Reset flag after a short delay to allow Editor to update
            // (The onChange handler needs to know this was remote to avoid loop)
        })

        return () => {
            socket.off("code-change")
        }
    }, [])

    const handleEditorChange = (value: string | undefined) => {
        if (value === undefined) return

        if (isRemoteUpdate.current) {
            isRemoteUpdate.current = false
            return
        }

        setCode(value)
        socket.emit("code-change", { roomId, code: value })
    }

    return (
        <Card className="h-full flex flex-col bg-[#1e1e1e] border-zinc-800 overflow-hidden">
            <div className="p-2 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-2">Shared Editor</span>
                <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[120px] h-8 bg-zinc-800 border-zinc-700 text-xs">
                        <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex-1">
                <Editor
                    height="100%"
                    language={language}
                    value={code}
                    theme="vs-dark"
                    onChange={handleEditorChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                    }}
                />
            </div>
        </Card>
    )
}
