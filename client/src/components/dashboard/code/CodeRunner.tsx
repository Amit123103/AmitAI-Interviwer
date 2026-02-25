"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Loader2, Play, AlertCircle, CheckCircle2, XCircle,
    Terminal, MonitorPlay, ChevronUp, ChevronDown,
    Clock, Cpu, MemoryStick, Zap, Copy, Check, RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from "framer-motion";

interface TestCase {
    input: string;
    output: string;
    isHidden?: boolean;
}

interface TestResult {
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
    error?: string;
}

interface CodeRunnerProps {
    onRun: () => void;
    onSubmit: () => void;
    isRunning: boolean;
    isSubmitting: boolean;
    testCases: TestCase[];
    testResults: TestResult[] | null;
    executionStats?: {
        runtime: number;
        memory: number;
    };
    error?: string;
    consoleOutput?: string;
    analysisOutput?: string;
}

export function CodeRunner({
    onRun,
    onSubmit,
    isRunning,
    isSubmitting,
    testCases,
    testResults,
    executionStats,
    error,
    consoleOutput,
    analysisOutput
}: CodeRunnerProps) {
    const [activeTab, setActiveTab] = useState<'testcases' | 'result' | 'console'>('testcases');
    const [selectedCase, setSelectedCase] = useState(0);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [copied, setCopied] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-switch to result tab when results come in
    useEffect(() => {
        if (testResults || error || consoleOutput || analysisOutput) {
            setActiveTab('result');
        }
    }, [testResults, error, consoleOutput, analysisOutput]);

    // Auto-scroll console
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [consoleOutput, testResults, error, analysisOutput]);

    const allPassed = testResults?.every(r => r.passed);
    const passedCount = testResults?.filter(r => r.passed).length ?? 0;
    const totalCount = testResults?.length ?? 0;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Format console output with colors
    const formatOutput = (text: string) => {
        return text.split('\n').map((line, i) => {
            let colorClass = 'text-zinc-300';
            if (line.startsWith('[Error]') || line.startsWith('Error:') || line.includes('error')) colorClass = 'text-red-400';
            else if (line.startsWith('✅') || line.includes('Passed') || line.includes('Accepted')) colorClass = 'text-emerald-400';
            else if (line.startsWith('⏱') || line.startsWith('💾')) colorClass = 'text-cyan-400';
            else if (line.startsWith('━━') || line.startsWith('🔧')) colorClass = 'text-violet-400';
            else if (line.startsWith('⚠️') || line.startsWith('⭐')) colorClass = 'text-amber-400';
            else if (line.startsWith('🎯')) colorClass = 'text-fuchsia-400';
            else if (line.startsWith('  •') || line.startsWith('  -')) colorClass = 'text-zinc-500';
            return (
                <div key={i} className="flex gap-3 group/line hover:bg-white/[0.02] px-1 rounded">
                    <span className="text-[10px] text-zinc-700 font-mono w-5 text-right select-none shrink-0 leading-relaxed">{i + 1}</span>
                    <span className={`${colorClass} leading-relaxed`}>{line || '\u00A0'}</span>
                </div>
            );
        });
    };

    return (
        <Card className={cn(
            "bg-zinc-900/60 backdrop-blur-2xl border-white/[0.06] flex flex-col transition-all duration-500 overflow-hidden relative",
            isCollapsed ? "h-12" : "h-full"
        )}>
            {/* Gradient top line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent z-10" />

            {/* Terminal Header */}
            <div className="h-12 flex items-center justify-between px-3 bg-zinc-950/80 border-b border-white/[0.06] shrink-0 relative z-10">
                <div className="flex items-center gap-1.5">
                    {/* macOS-style dots */}
                    <div className="flex gap-1.5 mr-4">
                        <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-400 transition-colors cursor-pointer" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-400 transition-colors cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)} />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-400 transition-colors cursor-pointer" />
                    </div>

                    {/* Tab buttons */}
                    {[
                        { key: 'testcases', label: 'Test Cases', icon: Terminal },
                        { key: 'result', label: 'Output', icon: MonitorPlay },
                        { key: 'console', label: 'Console', icon: Zap },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key as any); setIsCollapsed(false); }}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                activeTab === tab.key
                                    ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                                    : "text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.03]"
                            )}
                        >
                            <tab.icon className="w-3 h-3" /> {tab.label}
                            {tab.key === 'result' && testResults && (
                                <span className={cn(
                                    "ml-1 w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-black",
                                    allPassed ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                                )}>
                                    {allPassed ? '✓' : '✗'}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    {/* Execution stats badges */}
                    {executionStats && (
                        <div className="hidden md:flex items-center gap-3 mr-2">
                            <div className="flex items-center gap-1 bg-cyan-500/5 border border-cyan-500/10 rounded-md px-2 py-1">
                                <Clock className="w-3 h-3 text-cyan-400" />
                                <span className="text-[9px] font-black text-cyan-400">{executionStats.runtime}ms</span>
                            </div>
                            <div className="flex items-center gap-1 bg-violet-500/5 border border-violet-500/10 rounded-md px-2 py-1">
                                <Cpu className="w-3 h-3 text-violet-400" />
                                <span className="text-[9px] font-black text-violet-400">{(executionStats.memory / 1024).toFixed(1)}MB</span>
                            </div>
                        </div>
                    )}

                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={onRun}
                        disabled={isRunning || isSubmitting}
                        className="h-7 gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-[9px] uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] border-0 transition-all rounded-lg"
                    >
                        {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                        Run
                    </Button>
                    <Button
                        size="sm"
                        onClick={onSubmit}
                        disabled={isRunning || isSubmitting}
                        className="h-7 gap-1.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-black text-[9px] uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] border-0 transition-all rounded-lg"
                    >
                        {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                        Submit
                    </Button>

                    {/* Collapse toggle */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.05] transition-colors"
                    >
                        {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div ref={scrollRef} className={cn("flex-1 overflow-auto custom-scrollbar", isCollapsed && "hidden")}>

                {/* Test Cases Tab */}
                {activeTab === 'testcases' && (
                    <div className="p-4 space-y-3">
                        {/* Case Selector Tabs */}
                        <div className="flex gap-1.5 flex-wrap">
                            {testCases.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedCase(i)}
                                    className={cn(
                                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
                                        selectedCase === i
                                            ? "bg-violet-500/10 text-violet-400 border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.1)]"
                                            : "bg-zinc-950/50 text-zinc-600 border-white/[0.04] hover:border-white/[0.08] hover:text-zinc-400"
                                    )}
                                >
                                    Case {i + 1}
                                </button>
                            ))}
                        </div>

                        {/* Selected Case Details */}
                        {testCases[selectedCase] && (
                            <motion.div
                                key={selectedCase}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-3"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-600">Input</span>
                                        <button onClick={() => handleCopy(testCases[selectedCase].input)} className="text-zinc-700 hover:text-zinc-400 transition-colors">
                                            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                    </div>
                                    <div className="p-3 bg-black/50 rounded-xl border border-white/[0.04] font-mono text-sm text-cyan-300 selection:bg-violet-500/30">
                                        {testCases[selectedCase].input}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-600 block mb-1.5">Expected Output</span>
                                    <div className="p-3 bg-black/50 rounded-xl border border-white/[0.04] font-mono text-sm text-emerald-300 selection:bg-violet-500/30">
                                        {testCases[selectedCase].output}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* Result Tab */}
                {activeTab === 'result' && (
                    <div className="p-4">
                        {isRunning ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center border border-cyan-500/15 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                                    </div>
                                    {/* Pulse ring */}
                                    <div className="absolute inset-0 rounded-2xl border border-cyan-500/20 animate-ping" />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-sm font-bold text-white">Compiling & Executing</p>
                                    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Running test cases...</p>
                                </div>
                                {/* Animated dots */}
                                <div className="flex gap-1.5">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                                    ))}
                                </div>
                            </div>
                        ) : error ? (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/15">
                                            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Runtime Error</span>
                                    </div>
                                    <pre className="whitespace-pre-wrap font-mono text-sm text-red-300 bg-black/30 p-3 rounded-lg border border-red-500/10 leading-relaxed">{error}</pre>
                                </div>
                            </motion.div>
                        ) : analysisOutput ? (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
                                    <div className="font-mono text-sm leading-relaxed">
                                        {formatOutput(analysisOutput)}
                                    </div>
                                </div>
                            </motion.div>
                        ) : testResults ? (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                {/* Verdict Banner */}
                                <div className={cn(
                                    "flex items-center justify-between p-4 rounded-xl border relative overflow-hidden",
                                    allPassed
                                        ? "bg-emerald-500/5 border-emerald-500/15"
                                        : "bg-red-500/5 border-red-500/15"
                                )}>
                                    <div className={cn(
                                        "absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent to-transparent",
                                        allPassed ? "via-emerald-500/40" : "via-red-500/40"
                                    )} />
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center border",
                                            allPassed
                                                ? "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                                                : "bg-red-500/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                                        )}>
                                            {allPassed
                                                ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                                : <XCircle className="w-5 h-5 text-red-400" />
                                            }
                                        </div>
                                        <div>
                                            <h3 className={cn("font-black text-lg", allPassed ? "text-emerald-400" : "text-red-400")}>
                                                {allPassed ? "Accepted" : "Wrong Answer"}
                                            </h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                                                {passedCount} / {totalCount} test cases passed
                                            </p>
                                        </div>
                                    </div>

                                    {executionStats && (
                                        <div className="flex items-center gap-4 text-right">
                                            <div>
                                                <div className="text-[8px] font-black uppercase tracking-widest text-zinc-700">Runtime</div>
                                                <div className="text-sm font-black text-cyan-400">{executionStats.runtime}ms</div>
                                            </div>
                                            <div>
                                                <div className="text-[8px] font-black uppercase tracking-widest text-zinc-700">Memory</div>
                                                <div className="text-sm font-black text-violet-400">{(executionStats.memory / 1024).toFixed(1)}MB</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Pass/fail progress */}
                                <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-zinc-800">
                                    {testResults.map((r, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "flex-1 transition-all duration-500",
                                                r.passed ? "bg-emerald-500" : "bg-red-500"
                                            )}
                                            style={{ transitionDelay: `${i * 100}ms` }}
                                        />
                                    ))}
                                </div>

                                {/* Individual test results */}
                                <div className="space-y-2">
                                    {testResults.map((result, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.08 }}
                                            className={cn(
                                                "rounded-xl border overflow-hidden",
                                                result.passed
                                                    ? "bg-emerald-500/3 border-emerald-500/10"
                                                    : "bg-red-500/3 border-red-500/10"
                                            )}
                                        >
                                            <div className="flex items-center justify-between px-4 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    {result.passed
                                                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                                        : <XCircle className="w-3.5 h-3.5 text-red-400" />
                                                    }
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest",
                                                        result.passed ? "text-emerald-400" : "text-red-400"
                                                    )}>
                                                        Case {i + 1} — {result.passed ? "Passed" : "Failed"}
                                                    </span>
                                                </div>
                                                {result.error && (
                                                    <span className="text-[9px] font-bold text-red-500/50">Error: {result.error.slice(0, 40)}</span>
                                                )}
                                            </div>

                                            {!result.passed && (
                                                <div className="grid grid-cols-3 gap-3 px-4 pb-3">
                                                    <div>
                                                        <div className="text-[8px] font-black uppercase tracking-widest text-zinc-700 mb-1">Input</div>
                                                        <div className="p-2 bg-black/30 rounded-lg border border-white/[0.04] font-mono text-xs text-zinc-400 truncate">
                                                            {result.input}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[8px] font-black uppercase tracking-widest text-zinc-700 mb-1">Expected</div>
                                                        <div className="p-2 bg-black/30 rounded-lg border border-emerald-500/10 font-mono text-xs text-emerald-400 truncate">
                                                            {result.expected}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[8px] font-black uppercase tracking-widest text-zinc-700 mb-1">Your Output</div>
                                                        <div className="p-2 bg-black/30 rounded-lg border border-red-500/10 font-mono text-xs text-red-400 truncate">
                                                            {result.actual}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 gap-4 opacity-40">
                                <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 flex items-center justify-center border border-white/[0.04]">
                                    <MonitorPlay className="w-7 h-7 text-zinc-600" />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-sm font-bold text-zinc-500">No Output Yet</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Press Run to execute your code</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Console Tab */}
                {activeTab === 'console' && (
                    <div className="p-4">
                        {consoleOutput ? (
                            <div className="bg-black/50 rounded-xl border border-white/[0.04] p-4 font-mono text-sm leading-relaxed">
                                {formatOutput(consoleOutput)}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-40">
                                <Terminal className="w-7 h-7 text-zinc-600" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Console output will appear here</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
