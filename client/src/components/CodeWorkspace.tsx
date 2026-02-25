"use client"

import React, { useState, useEffect } from 'react'
import CodeSandbox from './CodeSandbox'
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Terminal, Code2, AlertCircle, Sparkles, Cpu } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface CodeWorkspaceProps {
    initialCode?: string;
    onCodeChange: (code: string) => void;
    onOutputChange: (output: string) => void;
    language?: string;
}

export default function CodeWorkspace({ initialCode = "", onCodeChange, onOutputChange, language = "python" }: CodeWorkspaceProps) {
    const [code, setCode] = useState(initialCode)
    const [aiThought, setAiThought] = useState("Awaiting code deployment for neural analysis...")
    const [complexity, setComplexity] = useState<"low" | "medium" | "high">("low")

    useEffect(() => {
        if (initialCode !== code) {
            setCode(initialCode);
        }
    }, [initialCode]);

    const [output, setOutput] = useState<{ stdout?: string; stderr?: string; error?: string } | undefined>(undefined)
    const [isRunning, setIsRunning] = useState(false)
    const [activeTab, setActiveTab] = useState("editor")

    useEffect(() => {
        setCode(initialCode)
    }, [initialCode])

    // Neural Optimizer Logic (Simulated)
    useEffect(() => {
        if (!code || code.length < 20) {
            setAiThought("Initial structure looks stable. Proceed with implementation.")
            setComplexity("low")
            return
        }

        const timeout = setTimeout(() => {
            if (code.includes('for') || code.includes('while')) {
                setAiThought("Loop detected. Monitoring O(n) complexity risk...")
                setComplexity("medium")
            }
            if (code.includes('recursive') || code.includes('memoization')) {
                setAiThought("Advanced recursion pattern identified. Optimizing memory traces...")
                setComplexity("high")
            }
            if (code.length > 500) {
                setAiThought("Structural volume increasing. Consider modular refactoring.")
                setComplexity("medium")
            }
        }, 1000)

        return () => clearTimeout(timeout)
    }, [code])

    const handleRunCode = async (lang: string, sourceCode: string) => {
        setIsRunning(true)
        setOutput(undefined)
        setActiveTab("console") // Auto-switch to console

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/execution/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language: lang, code: sourceCode })
            })

            const data = await res.json()

            if (data.error) {
                const errorLabel = data.run?.errorType ? `[${data.run.errorType.replace(/_/g, ' ')}]` : 'Error';
                setOutput({ error: `${errorLabel}: ${data.error}` })
                onOutputChange(`${errorLabel}: ${data.error}`)
            } else if (data.run) {
                setOutput({
                    stdout: data.run.stdout || '',
                    stderr: data.run.stderr || '',
                })
                onOutputChange(data.run.stdout || data.run.stderr || "No output")
            } else {
                setOutput({ stdout: 'Code executed successfully (no output)' })
                onOutputChange("No output")
            }
        } catch (err: any) {
            setOutput({ error: "Failed to execute code. Server might be down." })
            onOutputChange("Execution Error")
        } finally {
            setIsRunning(false)
        }
    }

    return (
        <div className="h-full flex flex-col gap-6 p-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 px-2">
                    <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-2xl h-14 backdrop-blur-3xl">
                        <TabsTrigger
                            value="editor"
                            className="flex items-center gap-3 px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-black uppercase tracking-[0.2em] text-[10px] transition-all"
                        >
                            <Code2 className="w-4 h-4" />
                            <span className="hidden sm:inline">IDE Cluster</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="console"
                            className="flex items-center gap-3 px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-black uppercase tracking-[0.2em] text-[10px] transition-all"
                        >
                            <Terminal className="w-4 h-4" />
                            <span className="hidden sm:inline">Quantum Shell</span>
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-4 bg-zinc-950/40 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-xl">
                        <Cpu className="w-3.5 h-3.5 text-primary/60" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Node: Local-Alpha</span>
                    </div>
                </div>

                <div className="flex-1 relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-950/40 backdrop-blur-3xl shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

                    <TabsContent value="editor" className="h-full mt-0 p-0 border-0 overflow-hidden relative">
                        {/* Neural Code Optimizer Floating HUD */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-10 right-10 z-20 pointer-events-none"
                        >
                            <div className="bg-zinc-950/80 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem] shadow-2xl flex items-center gap-6 min-w-[300px]">
                                <div className="relative">
                                    <div className={`w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-black/40 overflow-hidden`}>
                                        <div className={`absolute inset-0 opacity-20 bg-gradient-to-tr ${complexity === 'high' ? 'from-red-500' : complexity === 'medium' ? 'from-amber-500' : 'from-primary'} to-transparent`} />
                                        <Sparkles className={`w-5 h-5 ${complexity === 'high' ? 'text-red-500' : complexity === 'medium' ? 'text-amber-500' : 'text-primary'} animate-pulse`} />
                                    </div>
                                    <motion.div
                                        className={`absolute -inset-1 rounded-full border ${complexity === 'high' ? 'border-red-500/30' : complexity === 'medium' ? 'border-amber-500/30' : 'border-primary/30'}`}
                                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1 h-1 rounded-full ${complexity === 'high' ? 'bg-red-500' : complexity === 'medium' ? 'bg-amber-500' : 'bg-primary'}`} />
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Neural Insight</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-zinc-300 italic max-w-[200px] leading-tight">
                                        "{aiThought}"
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <CodeSandbox
                            code={code}
                            onChange={(val) => {
                                const newCode = val || ""
                                setCode(newCode)
                                onCodeChange(newCode)
                            }}
                            language={language}
                            onRun={handleRunCode}
                            isRunning={isRunning}
                            output={output}
                        />
                    </TabsContent>

                    <TabsContent value="console" className="h-full mt-0 p-0 relative overflow-hidden flex flex-col">
                        <div className="bg-black/80 flex-1 p-8 font-mono text-xs overflow-auto custom-scrollbar selection:bg-primary/30 selection:text-white">
                            <AnimatePresence mode="wait">
                                {isRunning ? (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-4 text-primary"
                                    >
                                        <div className="relative">
                                            <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                                            <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-25" />
                                        </div>
                                        <span className="uppercase tracking-[0.3em] font-black italic">Compiling Neural Streams...</span>
                                    </motion.div>
                                ) : output ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-8"
                                    >
                                        {output.stdout && (
                                            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="h-px w-8 bg-primary/30" />
                                                    <span className="text-primary/60 text-[9px] font-black uppercase tracking-[0.4em]">Standard Output</span>
                                                </div>
                                                <pre className="text-zinc-300 whitespace-pre-wrap leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">{output.stdout}</pre>
                                            </div>
                                        )}
                                        {output.stderr && (
                                            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="h-px w-8 bg-red-500/30" />
                                                    <span className="text-red-500/60 text-[9px] font-black uppercase tracking-[0.4em]">System Error</span>
                                                </div>
                                                <pre className="text-red-400 whitespace-pre-wrap leading-relaxed bg-red-500/5 p-4 rounded-2xl border border-red-500/10 italic">{output.stderr}</pre>
                                            </div>
                                        )}
                                        {output.error && (
                                            <div className="flex items-center gap-4 text-red-500 bg-red-500/10 p-6 rounded-[2rem] border border-red-500/20 backdrop-blur-xl animate-in zoom-in-95 duration-500">
                                                <AlertCircle className="w-6 h-6" />
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Execution Violation</p>
                                                    <p className="text-sm font-medium opacity-80">{output.error}</p>
                                                </div>
                                            </div>
                                        )}
                                        {!output.stdout && !output.stderr && !output.error && (
                                            <div className="text-zinc-500 flex items-center gap-3 italic">
                                                <Sparkles className="w-4 h-4" />
                                                <span>Session executed silently. Grid stable.</span>
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <div className="text-zinc-700 flex flex-col items-center justify-center h-full gap-6 opacity-40">
                                        <div className="relative">
                                            <Terminal className="w-16 h-16" />
                                            <motion.div
                                                className="absolute -top-2 -right-2 w-4 h-4 bg-zinc-800 rounded-full animate-pulse"
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-center max-w-[200px] leading-relaxed">Awaiting code deployment for quantum analysis</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
