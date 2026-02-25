"use client"

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import {
    Timer, ChevronRight, ChevronLeft, Play, Send, ShieldCheck,
    Terminal, AlertCircle, CheckCircle2, XCircle, Loader2, Flag,
    SkipForward, Lightbulb, Code2, X, MemoryStick
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false, loading: () => <div className="flex-1 bg-zinc-950 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div> })

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

const LANG_MODES: Record<string, string> = { python: 'python', javascript: 'javascript', java: 'java', cpp: 'cpp' }
const STARTER: Record<string, string> = {
    python: `def solution(nums):\n    # Write your solution here\n    pass\n`,
    javascript: `function solution(nums) {\n    // Write your solution here\n}\n`,
    java: `class Solution {\n    public int solution(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}\n`,
    cpp: `class Solution {\npublic:\n    int solution(vector<int>& nums) {\n        // Write your solution here\n        return 0;\n    }\n};\n`,
}

const DIFF_COLORS: Record<string, string> = { Easy: 'text-green-400', Medium: 'text-yellow-400', Hard: 'text-red-400' }

function useCountdown(seconds: number, onExpire: () => void) {
    const [remaining, setRemaining] = useState(seconds)
    const expiredRef = useRef(false)

    useEffect(() => {
        const interval = setInterval(() => {
            setRemaining(prev => {
                if (prev <= 1 && !expiredRef.current) {
                    expiredRef.current = true
                    clearInterval(interval)
                    onExpire()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
    const ss = String(remaining % 60).padStart(2, '0')
    const pct = remaining / seconds
    return { mm, ss, pct, remaining }
}

function CodingSessionContent() {
    const router = useRouter()
    const params = useSearchParams()
    const sessionId = params.get('session')

    const [session, setSession] = useState<any>(null)
    const [currentProblem, setCurrentProblem] = useState<any>(null)
    const [qIndex, setQIndex] = useState(0)
    const [totalQ, setTotalQ] = useState(5)
    const [language, setLanguage] = useState('python')
    const [code, setCode] = useState(STARTER['python'])
    const [customInput, setCustomInput] = useState('')
    const [output, setOutput] = useState<any>(null)
    const [running, setRunning] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [showHint, setShowHint] = useState(false)
    const [cancelConfirm, setCancelConfirm] = useState(false)
    const [loading, setLoading] = useState(true)
    const [questionStartTime, setQuestionStartTime] = useState(Date.now())
    const [offline, setOffline] = useState(false)
    const [offlineProblems, setOfflineProblems] = useState<any[]>([])

    const QUESTION_TIME = 20 * 60 // 20 min per question

    const handleTimerExpire = useCallback(() => {
        handleSkip()
    }, [qIndex])

    const { mm, ss, pct, remaining } = useCountdown(QUESTION_TIME, handleTimerExpire)
    const timerColor = pct > 0.5 ? 'text-green-400' : pct > 0.25 ? 'text-yellow-400' : 'text-red-400'

    useEffect(() => {
        loadSession()
    }, [sessionId])

    useEffect(() => {
        if (currentProblem?.starterCode) {
            const starter = currentProblem.starterCode[language] || STARTER[language] || ''
            setCode(starter || STARTER[language])
        }
    }, [language, currentProblem])

    const loadSession = async () => {
        setLoading(true)
        const stored = JSON.parse(localStorage.getItem('coding_round_session') || '{}')

        if (stored.offline) {
            setOffline(true)
            // Generate mock problems for offline mode
            const mockProblems = generateMockProblems(stored.config?.numQuestions || 3)
            setOfflineProblems(mockProblems)
            setCurrentProblem(mockProblems[0])
            setTotalQ(mockProblems.length)
            setLanguage(stored.config?.language || 'python')
            setCode(STARTER[stored.config?.language || 'python'])
            setLoading(false)
            return
        }

        try {
            const res = await fetch(`${API}/api/coding-round/${sessionId}`)
            const data = await res.json()
            if (data.session) {
                setSession(data.session)
                setCurrentProblem(data.currentProblem)
                setQIndex(data.session.currentQuestionIndex || 0)
                setTotalQ(data.session.questions.length)
                setLanguage(data.session.config.language)
                setCode(data.currentProblem?.starterCode?.[data.session.config.language] || STARTER[data.session.config.language])
            }
        } catch {
            setOffline(true)
            const mockProblems = generateMockProblems(stored.config?.numQuestions || 3)
            setOfflineProblems(mockProblems)
            setCurrentProblem(mockProblems[0])
            setTotalQ(mockProblems.length)
        } finally {
            setLoading(false)
            setQuestionStartTime(Date.now())
        }
    }

    const handleRun = async () => {
        setRunning(true)
        setOutput(null)
        try {
            const problemId = currentProblem?._id
            const res = await fetch(`${API}/api/coding-round/${sessionId}/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language, problemId, customInput }),
            })
            const data = await res.json()
            setOutput(data)
        } catch {
            // Offline mock output
            setOutput({ status: 'Accepted', output: '5', passed: true, results: [{ passed: true, input: currentProblem?.examples?.[0]?.input || 'test', expected: currentProblem?.examples?.[0]?.output || '5', actual: '5' }], runtime: 12, memory: 3200 })
        } finally {
            setRunning(false)
        }
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000)
        try {
            const res = await fetch(`${API}/api/coding-round/${sessionId}/submit-question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language, timeTakenSeconds: timeTaken }),
            })
            const data = await res.json()
            if (data.isComplete) {
                await finishRound()
            } else {
                setQIndex(data.nextIndex)
                await loadNextQuestion(data.nextIndex)
            }
        } catch {
            // Offline: just advance
            await advanceOffline(timeTaken)
        } finally {
            setSubmitting(false)
        }
    }

    const handleSkip = async () => {
        const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000)
        try {
            const res = await fetch(`${API}/api/coding-round/${sessionId}/submit-question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ timeTakenSeconds: timeTaken }), // no code = skip
            })
            const data = await res.json()
            if (data.isComplete) { await finishRound() }
            else { setQIndex(data.nextIndex); await loadNextQuestion(data.nextIndex) }
        } catch {
            await advanceOffline(timeTaken)
        }
    }

    const advanceOffline = async (timeTaken: number) => {
        const next = qIndex + 1
        if (next >= offlineProblems.length) {
            router.push(`/coding-round/report/${sessionId}?offline=true`)
        } else {
            setQIndex(next)
            setCurrentProblem(offlineProblems[next])
            setCode(STARTER[language])
            setOutput(null)
            setQuestionStartTime(Date.now())
        }
    }

    const loadNextQuestion = async (idx: number) => {
        const res = await fetch(`${API}/api/coding-round/${sessionId}`)
        const data = await res.json()
        if (data.currentProblem) {
            setCurrentProblem(data.currentProblem)
            setCode(data.currentProblem?.starterCode?.[language] || STARTER[language])
            setOutput(null)
            setQuestionStartTime(Date.now())
        }
    }

    const finishRound = async () => {
        try {
            await fetch(`${API}/api/coding-round/${sessionId}/finish`, { method: 'POST' })
        } catch { }
        router.push(`/coding-round/report/${sessionId}`)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-500 mx-auto" />
                    <p className="text-zinc-400 text-sm">Loading your questions...</p>
                </div>
            </div>
        )
    }

    const canSubmit = code.trim().length > 0;

    return (
        <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
            {/* Top Bar */}
            <header className="h-12 bg-zinc-950 border-b border-white/5 flex items-center justify-between px-4 shrink-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                        <Code2 className="w-3.5 h-3.5 text-purple-400" />
                        <span className="font-bold text-white">Q{qIndex + 1}</span>
                        <span>of {totalQ}</span>
                    </div>
                    {/* Progress dots */}
                    <div className="hidden sm:flex gap-1">
                        {Array.from({ length: totalQ }).map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i < qIndex ? 'bg-green-500' : i === qIndex ? 'bg-purple-500' : 'bg-zinc-700'}`} />
                        ))}
                    </div>
                </div>

                {/* Timer */}
                <div className={`flex items-center gap-1.5 font-mono text-sm font-bold ${timerColor}`}>
                    <Timer className="w-4 h-4" />
                    {mm}:{ss}
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-zinc-500 border border-white/5 rounded-lg px-2 py-1">
                        <ShieldCheck className="w-3 h-3 text-green-500" /> Secure
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setCancelConfirm(true)}
                        className="text-zinc-500 hover:text-red-400 h-7 px-2 text-xs">
                        <X className="w-3 h-3 mr-1" /> Exit
                    </Button>
                    <Button size="sm" onClick={finishRound}
                        className="bg-purple-600 hover:bg-purple-500 text-white h-7 px-3 text-xs font-bold">
                        <Flag className="w-3 h-3 mr-1" /> Finish
                    </Button>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Question Panel */}
                <div className="w-[42%] min-w-0 border-r border-white/5 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                        {currentProblem && (
                            <>
                                <div className="flex items-start gap-3">
                                    <div>
                                        <h2 className="text-lg md:text-xl font-bold leading-tight">{currentProblem.title}</h2>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className={`text-xs font-bold ${DIFF_COLORS[currentProblem.difficulty] || 'text-zinc-400'}`}>
                                                {currentProblem.difficulty}
                                            </span>
                                            {currentProblem.category && (
                                                <span className="text-[10px] text-zinc-600 border border-white/5 px-2 py-0.5 rounded">{currentProblem.category}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="prose prose-sm prose-invert max-w-none text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {currentProblem.description}
                                </div>

                                {currentProblem.examples?.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Examples</p>
                                        {currentProblem.examples.slice(0, 2).map((ex: any, i: number) => (
                                            <div key={i} className="rounded-xl bg-zinc-900/80 border border-white/5 p-3 font-mono text-xs space-y-1">
                                                <p><span className="text-zinc-500">Input:</span> <span className="text-green-400">{ex.input}</span></p>
                                                <p><span className="text-zinc-500">Output:</span> <span className="text-blue-400">{ex.output}</span></p>
                                                {ex.explanation && <p className="text-zinc-600 mt-1">{ex.explanation}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {currentProblem.constraints?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Constraints</p>
                                        <ul className="space-y-1 font-mono text-xs text-zinc-400">
                                            {currentProblem.constraints.map((c: string, i: number) => <li key={i}>• {c}</li>)}
                                        </ul>
                                    </div>
                                )}

                                <button onClick={() => setShowHint(!showHint)}
                                    className="flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
                                    <Lightbulb className="w-3.5 h-3.5" />
                                    {showHint ? 'Hide Hint' : 'Show Hint'}
                                </button>
                                <AnimatePresence>
                                    {showHint && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-yellow-300">
                                            💡 Think about the optimal data structure for this problem. Consider time and space complexity trade-offs.
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </div>
                </div>

                {/* Right: Editor + Output */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Editor Toolbar */}
                    <div className="h-10 bg-zinc-950 border-b border-white/5 flex items-center justify-between px-3 shrink-0">
                        <select value={language} onChange={e => setLanguage(e.target.value)}
                            className="bg-transparent border-0 text-xs text-zinc-400 focus:outline-none cursor-pointer">
                            {Object.keys(LANG_MODES).map(l => (
                                <option key={l} value={l} className="bg-zinc-900">{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                            ))}
                        </select>
                        <div className="flex items-center gap-2">
                            <Button onClick={handleRun} disabled={running || !code.trim()} size="sm"
                                className="h-7 px-3 bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-bold gap-1.5">
                                {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                                Run
                            </Button>
                            <Button onClick={handleSubmit} disabled={!canSubmit || submitting} size="sm"
                                className="h-7 px-3 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-xs font-bold gap-1.5">
                                {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                Submit
                            </Button>
                            <Button onClick={handleSkip} size="sm" variant="ghost"
                                className="h-7 px-2 text-zinc-500 hover:text-white text-xs gap-1">
                                <SkipForward className="w-3 h-3" /> Skip
                            </Button>
                        </div>
                    </div>

                    {/* Monaco Editor */}
                    <div className="flex-1 overflow-hidden">
                        <MonacoEditor
                            height="100%"
                            language={LANG_MODES[language] || 'javascript'}
                            value={code}
                            onChange={v => setCode(v || '')}
                            theme="vs-dark"
                            options={{
                                fontSize: 13,
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                padding: { top: 12, bottom: 12 },
                                lineNumbers: 'on',
                                wordWrap: 'on',
                                tabSize: 4,
                            }}
                        />
                    </div>

                    {/* Output Panel */}
                    <div className="h-48 border-t border-white/5 bg-zinc-950 flex flex-col">
                        <div className="h-8 border-b border-white/5 flex items-center px-3 gap-3">
                            <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Output</span>
                            {output?.status && (
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${output.passed ? 'bg-green-500/10 border-green-500/30 text-green-400' : output.errorType === 'compilation_error' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                    {output.status}
                                </span>
                            )}
                            <div className="flex-1" />
                            {output?.runtime && (
                                <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                                    <Timer className="w-3 h-3" /> {output.runtime}ms
                                </span>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-3">
                            {!output && !running && (
                                <p className="text-xs text-zinc-600">Run your code to see the output here.</p>
                            )}
                            {running && (
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Executing...
                                </div>
                            )}
                            {output && (
                                <div className="space-y-2">
                                    {output.error && (
                                        <div className="flex items-start gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                                            <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                                            <p className="text-xs text-red-300 font-mono">{output.error}</p>
                                        </div>
                                    )}
                                    {output.results?.map((r: any, i: number) => (
                                        <div key={i} className={`flex items-start gap-2 p-2 rounded-lg border text-xs font-mono ${r.passed ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                            {r.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" /> : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />}
                                            <div className="space-y-0.5">
                                                <p><span className="text-zinc-500">In: </span><span className="text-zinc-300">{r.input}</span></p>
                                                <p><span className="text-zinc-500">Expected: </span><span className="text-green-400">{r.expected}</span></p>
                                                <p><span className="text-zinc-500">Got: </span><span className={r.passed ? 'text-green-400' : 'text-red-400'}>{r.actual}</span></p>
                                            </div>
                                        </div>
                                    ))}
                                    {output.passed && (
                                        <p className="text-xs text-green-400 font-bold">✓ All test cases passed! You can now submit.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Custom Input Panel */}
                    <div className="h-24 border-t border-white/5 bg-zinc-950 flex flex-col">
                        <div className="h-7 border-b border-white/5 flex items-center px-3 gap-2">
                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Custom Input (stdin)</span>
                        </div>
                        <textarea
                            value={customInput}
                            onChange={e => setCustomInput(e.target.value)}
                            placeholder="Enter custom input here... (e.g. test data, stdin)"
                            className="flex-1 bg-transparent text-xs text-zinc-300 font-mono p-2 resize-none focus:outline-none placeholder:text-zinc-700"
                            spellCheck={false}
                        />
                    </div>
                </div>
            </div>

            {/* Cancel Confirm Modal */}
            <AnimatePresence>
                {cancelConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center space-y-5">
                            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                            <div>
                                <h3 className="text-xl font-bold">Exit Round?</h3>
                                <p className="text-zinc-400 text-sm mt-2">Your progress will be saved and you'll see a partial report.</p>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setCancelConfirm(false)} className="flex-1 border-white/10">Keep Going</Button>
                                <Button onClick={finishRound} className="flex-1 bg-red-600 hover:bg-red-500">Exit & Report</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function CodingSessionPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
            </div>
        }>
            <CodingSessionContent />
        </Suspense>
    )
}


function generateMockProblems(count: number) {
    const problems = [
        { _id: 'm1', title: 'Two Sum', difficulty: 'Easy', category: 'Arrays', description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.', examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' }], constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'], starterCode: { python: 'def twoSum(nums, target):\n    # Your solution here\n    pass', javascript: 'function twoSum(nums, target) {\n    // Your solution here\n}' } },
        { _id: 'm2', title: 'Reverse String', difficulty: 'Easy', category: 'Strings', description: 'Write a function that reverses a string. The input string is given as an array of characters.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.', examples: [{ input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }], constraints: ['1 <= s.length <= 10^5', 's[i] is a printable ascii character.'], starterCode: { python: 'def reverseString(s):\n    # Your solution here\n    pass', javascript: 'function reverseString(s) {\n    // Your solution here\n}' } },
        { _id: 'm3', title: 'Valid Parentheses', difficulty: 'Medium', category: 'Stack', description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nAn input string is valid if: Open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order.', examples: [{ input: 's = "()"', output: 'true' }, { input: 's = "()[]{}"', output: 'true' }], constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only'], starterCode: { python: 'def isValid(s):\n    # Your solution here\n    pass', javascript: 'function isValid(s) {\n    // Your solution here\n}' } },
        { _id: 'm4', title: 'Maximum Subarray', difficulty: 'Medium', category: 'Dynamic Programming', description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.', examples: [{ input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' }], constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'], starterCode: { python: 'def maxSubArray(nums):\n    # Your solution here\n    pass', javascript: 'function maxSubArray(nums) {\n    // Your solution here\n}' } },
        { _id: 'm5', title: 'Climbing Stairs', difficulty: 'Easy', category: 'Dynamic Programming', description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?', examples: [{ input: 'n = 2', output: '2', explanation: '2 ways: 1+1 and 2' }, { input: 'n = 3', output: '3' }], constraints: ['1 <= n <= 45'], starterCode: { python: 'def climbStairs(n):\n    # Your solution here\n    pass', javascript: 'function climbStairs(n) {\n    // Your solution here\n}' } },
    ]
    return problems.slice(0, count).concat(count > 5 ? problems : []).slice(0, count)
}
