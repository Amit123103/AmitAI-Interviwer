"use client"

import React, { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2, Play, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CodeSandboxProps {
    code: string;
    onChange: (value: string | undefined) => void;
    language?: string;
    onRun?: (language: string, code: string) => void;
    output?: { stdout?: string; stderr?: string; error?: string };
    isRunning?: boolean;
}

export default function CodeSandbox({ code, onChange, language = "python", onRun, output, isRunning }: CodeSandboxProps) {
    const [selectedLanguage, setSelectedLanguage] = useState(language)
    const [showConsole, setShowConsole] = useState(false)

    const handleEditorChange = (value: string | undefined) => {
        onChange(value)
    }

    const handleRun = () => {
        if (onRun) {
            setShowConsole(true)
            onRun(selectedLanguage, code)
        }
    }

    return (
        <Card className="h-full bg-zinc-900/50 border-white/5 flex flex-col overflow-hidden rounded-3xl">
            <CardHeader className="bg-black/40 border-b border-white/5 py-3 px-6 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Code2 className="w-4 h-4 text-primary" />
                        </div>
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-400">
                            Coding Sandbox
                        </CardTitle>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary/50"
                        >
                            <option value="python">Python</option>
                            <option value="javascript">JavaScript</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                        </select>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                            onClick={() => {
                                setShowConsole(!showConsole)
                            }}
                        >
                            <RefreshCcw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                            size="sm"
                            className="bg-primary text-black hover:bg-primary/90 font-bold px-4 h-8 rounded-lg gap-2 shadow-lg shadow-primary/20"
                            onClick={handleRun}
                            disabled={isRunning}
                        >
                            {isRunning ? (
                                <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Play className="w-3.5 h-3.5 fill-current" />
                            )}
                            Run
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 bg-[#1e1e1e] flex flex-col relative overflow-hidden">
                <div className="flex-1 min-h-0">
                    <Editor
                        height="100%"
                        language={selectedLanguage}
                        value={code}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 20 },
                            cursorBlinking: "smooth",
                            smoothScrolling: true,
                            lineNumbersMinChars: 3,
                        }}
                        onChange={handleEditorChange}
                    />
                </div>

                {/* Console Output */}
                {showConsole && (
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-black/90 border-t border-white/10 flex flex-col z-10 backdrop-blur-xl">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-zinc-900/50">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Terminal Output</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[10px] uppercase font-bold text-zinc-500 hover:text-white"
                                onClick={() => setShowConsole(false)}
                            >
                                Close
                            </Button>
                        </div>
                        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto scrollbar-hide">
                            {isRunning ? (
                                <div className="text-primary animate-pulse italic">Executing code...</div>
                            ) : (output?.stdout || output?.stderr || output?.error) ? (
                                <div className="space-y-2">
                                    {output.stdout && <pre className="text-zinc-300 break-all whitespace-pre-wrap">{output.stdout}</pre>}
                                    {output.stderr && <pre className="text-red-400 break-all whitespace-pre-wrap">{output.stderr}</pre>}
                                    {output.error && <pre className="text-red-500 font-bold">{output.error}</pre>}
                                </div>
                            ) : (
                                <div className="text-zinc-600 italic">No output yet. Click 'Run' to execute.</div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
