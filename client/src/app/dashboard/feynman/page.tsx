"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, BookOpen, Brain, MessageSquare, Send, Sparkles, Star, Target, Lightbulb, User, ShieldCheck, ChevronRight, CheckCircle, Coins } from "lucide-react"
import AmitAICoin from "@/components/reward-system/AmitAICoin"
import Link from "next/link"
import Logo from "@/components/ui/Logo"

// Types
type ChatMessage = {
    id: string;
    role: "student" | "ai" | "system";
    content: string;
    timestamp: Date;
};

type Topic = {
    id: string;
    title: string;
    description: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
};

const TOPICS: Topic[] = [
    { id: "react-hooks", title: "React Hooks", description: "Explain how useState and useEffect work under the hood.", difficulty: "Intermediate" },
    { id: "event-loop", title: "JavaScript Event Loop", description: "How does JS handle asynchronous operations single-threaded?", difficulty: "Advanced" },
    { id: "rest-api", title: "REST APIs", description: "What makes an API RESTful? Explain the constraints.", difficulty: "Beginner" },
    { id: "db-indexing", title: "Database Indexing", description: "Explain B-Trees and how indexing speeds up queries.", difficulty: "Advanced" },
];

export default function FeynmanExplainerPage() {
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [sessionPhase, setSessionPhase] = useState<"select" | "explain" | "chat" | "evaluation">("select");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSelectTopic = (topic: Topic) => {
        setSelectedTopic(topic);
        setSessionPhase("explain");
        setMessages([
            { id: "sys-1", role: "system", content: `Topic selected: ${topic.title}. Start by typing out an initial explanation like you are teaching a beginner.`, timestamp: new Date() }
        ]);
    };

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const newMsg: ChatMessage = {
            id: Date.now().toString(),
            role: "student",
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMsg]);
        setInputValue("");
        setIsTyping(true);

        if (sessionPhase === "explain") {
            setSessionPhase("chat");
        }

        // Simulate AI response
        setTimeout(() => {
            setIsTyping(false);

            // Mock AI behavior based on phase
            if (sessionPhase === "explain" || messages.length < 5) {
                const beginnerQuestions = [
                    "I'm a bit confused, what do you mean by that exactly?",
                    "Could you give me an analogy for that? It sounds complicated.",
                    "Wait, why does it work that way? Can you break it down further?",
                    "That makes sense, but what happens if an error occurs there?",
                    "I think I get it. So is it similar to how a library organizes books?"
                ];
                const randomQ = beginnerQuestions[Math.floor(Math.random() * beginnerQuestions.length)];

                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: "ai",
                    content: randomQ,
                    timestamp: new Date()
                }]);
            } else if (messages.length >= 5 && sessionPhase !== "evaluation") {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: "ai",
                    content: "I think I fully understand it now! You can 'End Session' to get your evaluation.",
                    timestamp: new Date()
                }]);
            }
        }, 1500);
    };

    const handleEndSession = () => {
        setSessionPhase("evaluation");
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans relative overflow-hidden aurora-glow">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-10 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] orb-float pointer-events-none" />
            <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] orb-float pointer-events-none" style={{ animationDelay: '2s' }} />

            {/* Header */}
            <div className="h-20 border-b border-white/10 bg-zinc-950/60 backdrop-blur-2xl flex items-center justify-between px-8 shrink-0 relative z-50">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                            <Brain className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="font-black text-2xl tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Feynman Explainer</h1>
                            <p className="text-sm font-medium text-zinc-500">Learn by teaching. Break down concepts simply.</p>
                        </div>
                    </div>
                </div>

                {sessionPhase === "chat" && (
                    <button
                        onClick={handleEndSession}
                        className="px-6 py-2 rounded-xl text-sm font-black uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-105 transition-all"
                    >
                        End & Evaluate
                    </button>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden relative z-10 max-w-7xl mx-auto w-full p-6 gap-6">

                {/* Left Sidebar (Topics or Status) */}
                <div className="w-full max-w-sm flex flex-col gap-6">

                    {/* Active Topic Card */}
                    {selectedTopic ? (
                        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20">
                                    <Lightbulb className="w-6 h-6" />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 rounded-lg border border-white/10 ${selectedTopic.difficulty === 'Beginner' ? 'text-emerald-400' :
                                    selectedTopic.difficulty === 'Intermediate' ? 'text-yellow-400' : 'text-rose-400'
                                    }`}>
                                    {selectedTopic.difficulty}
                                </span>
                            </div>
                            <h2 className="text-xl font-black mb-2">{selectedTopic.title}</h2>
                            <p className="text-sm text-zinc-400 leading-relaxed font-medium">{selectedTopic.description}</p>

                            <button
                                onClick={() => { setSelectedTopic(null); setSessionPhase("select"); setMessages([]); }}
                                className="mt-6 text-[11px] font-black uppercase text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
                            >
                                <ArrowLeft className="w-3 h-3" /> Change Topic
                            </button>
                        </div>
                    ) : (
                        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex-1 overflow-y-auto custom-scrollbar">
                            <h2 className="text-lg font-black mb-6 flex items-center gap-2">
                                <Target className="w-5 h-5 text-blue-400" /> Select a Topic
                            </h2>
                            <div className="space-y-4">
                                {TOPICS.map(topic => (
                                    <button
                                        key={topic.id}
                                        onClick={() => handleSelectTopic(topic)}
                                        className="w-full text-left p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-bold text-sm group-hover:text-blue-400 transition-colors">{topic.title}</h3>
                                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <p className="text-xs text-zinc-500 line-clamp-2">{topic.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* How it works card */}
                    <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 shadow-inner text-sm text-zinc-400 leading-relaxed font-medium hidden lg:block">
                        <strong className="text-white">The Feynman Technique:</strong>
                        <ol className="list-decimal pl-4 mt-3 space-y-2 opacity-80">
                            <li>Choose a concept</li>
                            <li>Teach it to a beginner (the AI)</li>
                            <li>Identify your knowledge gaps</li>
                            <li>Review and simplify</li>
                        </ol>
                    </div>
                </div>

                {/* Right Area (Chat & Interactions) */}
                <div className="flex-1 bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col relative overflow-hidden">

                    {sessionPhase === "select" ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-24 h-24 bg-blue-500/5 rounded-full flex items-center justify-center mb-6 border border-blue-500/10 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
                                <MessageSquare className="w-10 h-10 text-blue-400 opacity-50" />
                            </div>
                            <h3 className="text-2xl font-black text-zinc-300 mb-4">Awaiting Topic Selection</h3>
                            <p className="text-zinc-500 max-w-md mx-auto">Pick a topic from the sidebar you wish to master. Once selected, you'll enter teaching mode where our AI will act as your curious student.</p>
                        </div>
                    ) : sessionPhase === "evaluation" ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                            <AnimatePresence>
                                {isTyping ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full gap-4">
                                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                                            <Brain className="w-8 h-8 text-blue-400 animate-pulse" />
                                        </div>
                                        <h3 className="text-lg font-black text-blue-400 bg-clip-text">Evaluating your explanation...</h3>
                                    </motion.div>
                                ) : (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-8 pb-10">
                                        <div className="text-center space-y-4 mb-10">
                                            <div className="inline-flex w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.2)] mb-2">
                                                <ShieldCheck className="w-10 h-10 text-emerald-400" />
                                            </div>
                                            <h2 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Great Job!</h2>
                                            <p className="text-zinc-400 text-lg">You scored <span className="text-white font-bold">85% Mastery</span> on {selectedTopic?.title}.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-6 bg-black/40 border border-white/5 rounded-3xl">
                                                <h4 className="text-emerald-400 font-black mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> What you got right</h4>
                                                <ul className="space-y-3 text-sm text-zinc-300">
                                                    <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span> Clearly explained the primary purpose.</li>
                                                    <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span> Used an excellent real-world analogy.</li>
                                                    <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span> Handled follow-up questions well.</li>
                                                </ul>
                                            </div>
                                            <div className="p-6 bg-black/40 border border-white/5 rounded-3xl">
                                                <h4 className="text-yellow-400 font-black mb-4 flex items-center gap-2"><Star className="w-5 h-5" /> Areas to improve</h4>
                                                <ul className="space-y-3 text-sm text-zinc-300">
                                                    <li className="flex items-start gap-2"><span className="text-yellow-500 mt-0.5">•</span> You skipped over edge-case scenarios.</li>
                                                    <li className="flex items-start gap-2"><span className="text-yellow-500 mt-0.5">•</span> Jargon usage: try to explain "asynchronous" more simply next time.</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-3xl">
                                            <h4 className="font-black text-yellow-400 mb-2 flex items-center gap-2">
                                                <AmitAICoin size={18} animate /> AmitAI Coins Earned
                                            </h4>
                                            <p className="text-2xl font-black text-white">+500 Coins</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <>
                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                                <AnimatePresence>
                                    {messages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${msg.role === 'student' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}
                                        >
                                            {msg.role === 'system' ? (
                                                <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                                                    {msg.content}
                                                </div>
                                            ) : (
                                                <div className={`flex gap-4 max-w-[80%] ${msg.role === 'student' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center shadow-lg border ${msg.role === 'ai' ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                                                        }`}>
                                                        {msg.role === 'ai' ? <Brain className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                                    </div>
                                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.role === 'student' ? 'bg-blue-600/20 border border-blue-500/20 text-blue-50' : 'bg-black/50 border border-white/10 text-zinc-300'
                                                        } ${msg.role === 'student' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                    {isTyping && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                                            <div className="flex gap-4 max-w-[80%]">
                                                <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg">
                                                    <Brain className="w-5 h-5" />
                                                </div>
                                                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex items-center gap-2 rounded-tl-sm">
                                                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                                                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                                                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className="p-6 bg-black/40 border-t border-white/5">
                                <form
                                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                    className="flex gap-4"
                                >
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={e => setInputValue(e.target.value)}
                                            placeholder="Explain the concept simply..."
                                            className="w-full h-14 bg-zinc-900 border border-white/10 hover:border-white/20 focus:border-blue-500/50 rounded-2xl px-6 outline-none transition-all placeholder:text-zinc-600 text-sm shadow-inner"
                                            disabled={isTyping}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!inputValue.trim() || isTyping}
                                        className="h-14 w-14 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-2xl flex items-center justify-center transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] shrink-0"
                                    >
                                        <Send className="w-5 h-5 ml-1" />
                                    </button>
                                </form>
                                <p className="text-center text-[10px] text-zinc-600 font-medium uppercase tracking-widest mt-4 flex items-center justify-center gap-1.5">
                                    <Sparkles className="w-3 h-3 text-zinc-500" /> AI powered learning
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
