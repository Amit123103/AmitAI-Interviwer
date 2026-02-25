"use client"

import React from "react"
import { motion } from "framer-motion"
import { Quote, Star, TrendingUp, Award, Sparkles, Users, Briefcase, Trophy, GraduationCap } from "lucide-react"

const TESTIMONIALS = [
    {
        name: "ALEX RIVERA",
        role: "Senior Frontend Engineer @ Google",
        text: "The architectural depth of the AI interviewer is staggering. It didn't just ask about coding; it challenged my system design intuition. I went into my final loops with zero anxiety.",
        growth: "+45% Confidence",
        accentColor: "text-violet-400",
        borderHover: "hover:border-violet-500/20",
        badgeBg: "bg-violet-500/10 border-violet-500/20",
    },
    {
        name: "PRIYA SHARMA",
        role: "Fullstack Developer @ Uber",
        text: "The real-time sentiment analysis was a game changer. AMITAI caught when I was getting too defensive during technical disagreements in the mock interview.",
        growth: "+30% Communication",
        accentColor: "text-blue-400",
        borderHover: "hover:border-blue-500/20",
        badgeBg: "bg-blue-500/10 border-blue-500/20",
    },
    {
        name: "MARCUS CHEN",
        role: "Staff Engineer @ Meta",
        text: "The 'Crystalline' UI isn't just aesthetic—it's functional. The live telemetry helped me visualize exactly where my technical explanations were losing clarity.",
        growth: "Offered L6 Role",
        accentColor: "text-emerald-400",
        borderHover: "hover:border-emerald-500/20",
        badgeBg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
        name: "SOFIA MARTINEZ",
        role: "ML Engineer @ Amazon",
        text: "I was skeptical about AI interview prep. After 5 sessions, I nailed every behavioral question and got a 40% higher offer than expected. The adaptive difficulty is next-level.",
        growth: "+40% Offer",
        accentColor: "text-amber-400",
        borderHover: "hover:border-amber-500/20",
        badgeBg: "bg-amber-500/10 border-amber-500/20",
    },
    {
        name: "JAMES WILSON",
        role: "Backend Lead @ Stripe",
        text: "AMITAI's knowledge of distributed systems is remarkable. It pushed me on CAP theorem trade-offs that I hadn't considered. My system design rounds went from weak to dominant.",
        growth: "+52% Technical",
        accentColor: "text-rose-400",
        borderHover: "hover:border-rose-500/20",
        badgeBg: "bg-rose-500/10 border-rose-500/20",
    },
    {
        name: "AISHA PATEL",
        role: "iOS Engineer @ Apple",
        text: "The voice analysis caught my habit of filler words. After 3 sessions, I reduced my 'um's by 80%. My interviewer at Apple commented on how articulate I was.",
        growth: "Landed Dream Job",
        accentColor: "text-cyan-400",
        borderHover: "hover:border-cyan-500/20",
        badgeBg: "bg-cyan-500/10 border-cyan-500/20",
    },
]

export default function SuccessWall() {
    return (
        <section className="w-full py-40 relative px-6 bg-zinc-950/20 overflow-hidden">
            {/* Background glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/[0.03] blur-[180px] rounded-full pointer-events-none" />
            <div className="absolute top-[20%] right-0 w-[300px] h-[300px] bg-violet-500/[0.02] blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[10%] left-0 w-[300px] h-[300px] bg-blue-500/[0.02] blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto">
                <div className="flex flex-col items-center text-center mb-24 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/[0.06] border border-emerald-500/15 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
                        <Award className="w-3 h-3" /> Candidate Success Stories
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.9]">
                        <span className="gradient-text">REAL RESULTS</span> <br /> <span className="text-zinc-500">FROM</span> <span className="text-emerald-400">ELITE</span> <span className="text-blue-400">TALENT</span>
                    </h2>
                    <p className="text-zinc-500 max-w-lg font-medium">Hear from <span className="text-violet-400 font-bold">engineers</span> who used <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent font-bold">AMITAI</span> to land positions at the world's <span className="text-emerald-400 font-bold">top tech companies</span>.</p>
                    <div className="h-1 w-20 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full" />
                </div>

                {/* Success stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-20">
                    {[
                        { icon: <Users className="w-5 h-5" />, value: "50K+", label: "Active Users", color: "text-violet-400", bg: "bg-violet-500/10" },
                        { icon: <Briefcase className="w-5 h-5" />, value: "89%", label: "Got Hired", color: "text-blue-400", bg: "bg-blue-500/10" },
                        { icon: <Trophy className="w-5 h-5" />, value: "12K+", label: "FAANG Offers", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                        { icon: <GraduationCap className="w-5 h-5" />, value: "4.9★", label: "Avg Rating", color: "text-amber-400", bg: "bg-amber-500/10" },
                    ].map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex flex-col items-center gap-3 p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:border-white/15 transition-all"
                        >
                            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>{s.icon}</div>
                            <span className={`text-2xl font-black italic tracking-tighter ${s.color}`}>{s.value}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">{s.label}</span>
                        </motion.div>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`bg-white/[0.02] backdrop-blur-3xl border border-white/[0.06] p-10 rounded-[3rem] space-y-8 relative group ${t.borderHover} transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.2)]`}
                        >
                            {/* Top highlight edge */}
                            <div className="absolute top-0 inset-x-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent rounded-full" />

                            <div className="absolute top-10 right-10 text-white/[0.03] group-hover:text-white/[0.06] transition-colors">
                                <Quote className="w-16 h-16" />
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-1 text-amber-400">
                                    {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-current" />)}
                                </div>
                                <p className="text-[15px] text-zinc-300 font-medium leading-relaxed italic">
                                    &ldquo;{t.text}&rdquo;
                                </p>
                            </div>

                            <div className="flex items-end justify-between pt-6 border-t border-white/[0.04]">
                                <div className="space-y-1">
                                    <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] italic ${t.accentColor}`}>{t.name}</h4>
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{t.role}</p>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1.5 ${t.badgeBg} border rounded-xl`}>
                                    <TrendingUp className={`w-3 h-3 ${t.accentColor}`} />
                                    <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${t.accentColor}`}>{t.growth}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 flex flex-col items-center gap-8">
                    <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-[10px] flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-violet-400/50" />
                        Trusted by engineers from
                        <Sparkles className="w-3 h-3 text-violet-400/50" />
                    </p>
                    <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
                        {[
                            { name: "GOOGLE", color: "text-blue-400" },
                            { name: "UBER", color: "text-violet-400" },
                            { name: "META", color: "text-cyan-400" },
                            { name: "AMAZON", color: "text-amber-400" },
                            { name: "APPLE", color: "text-zinc-300" },
                            { name: "STRIPE", color: "text-emerald-400" },
                            { name: "NETFLIX", color: "text-rose-400" },
                            { name: "MICROSOFT", color: "text-blue-300" },
                        ].map((brand) => (
                            <motion.span
                                key={brand.name}
                                whileHover={{ scale: 1.1 }}
                                className={`text-xl font-black italic tracking-tighter ${brand.color} opacity-40 hover:opacity-100 transition-all cursor-default`}
                            >
                                {brand.name}
                            </motion.span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
