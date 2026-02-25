"use client"

import React from 'react'
import { Check, Crown, Zap, Rocket, ArrowLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import MeshBackground from "@/app/dashboard/components/MeshBackground"
import HolographicHud from "@/components/ui/HolographicHud"
import TiltCard from "@/components/ui/TiltCard"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

const PLANS = [
    {
        id: 'monthly',
        name: 'Monthly',
        price: 150,
        duration: '1 Month',
        perDay: '₹5/day',
        icon: <Zap className="w-6 h-6" />,
        gradient: 'from-blue-500 to-cyan-500',
        shadow: 'shadow-blue-500/20',
        borderHover: 'hover:border-blue-500/40',
        features: [
            'Unlimited AI Interviews',
            'Detailed Neural Reports',
            'Priority AI Processing',
            'System Design Mode',
            'Multi-Language Execution',
        ],
        popular: false,
    },
    {
        id: '6month',
        name: '6-Month',
        price: 850,
        duration: '6 Months',
        perDay: '₹4.7/day',
        savings: 'Save ₹50',
        icon: <Crown className="w-6 h-6" />,
        gradient: 'from-violet-500 to-purple-500',
        shadow: 'shadow-violet-500/20',
        borderHover: 'hover:border-violet-500/40',
        features: [
            'Everything in Monthly',
            'Unlimited AI Interviews',
            'Advanced Analytics Dashboard',
            'Priority Support',
            'Early Access to New Features',
            'Custom Interview Templates',
        ],
        popular: true,
    },
    {
        id: 'yearly',
        name: 'Yearly',
        price: 1700,
        duration: '12 Months',
        perDay: '₹4.6/day',
        savings: 'Save ₹100',
        icon: <Rocket className="w-6 h-6" />,
        gradient: 'from-amber-500 to-orange-500',
        shadow: 'shadow-amber-500/20',
        borderHover: 'hover:border-amber-500/40',
        features: [
            'Everything in 6-Month',
            'Unlimited AI Interviews',
            'Exclusive Pro Badge',
            '1-on-1 AI Coaching Sessions',
            'Resume AI Analysis',
            'Lifetime Feature Updates',
            'Priority Queue for All Services',
        ],
        popular: false,
    },
]

export default function PricingPage() {
    const router = useRouter()

    const handleSelectPlan = (planId: string) => {
        const userStr = localStorage.getItem("user")
        if (!userStr) {
            router.push("/auth/login")
            return
        }
        router.push(`/pricing/payment?plan=${planId}`)
    }

    return (
        <div className="min-h-screen bg-transparent text-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative overflow-hidden">
            <MeshBackground />
            <HolographicHud />
            <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 relative z-10">
                {/* Back button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold">Back</span>
                </motion.button>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-3 sm:space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mx-auto">
                        <Sparkles className="w-3 h-3" /> Upgrade to Pro
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
                        Choose Your Plan
                    </h1>
                    <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
                        Unlock <span className="text-violet-400 font-bold">unlimited AI interviews</span>, advanced analytics, and premium features to master your next interview.
                    </p>
                </motion.div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
                    {PLANS.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.15 }}
                        >
                            <TiltCard className={`relative overflow-hidden group transition-all duration-300 backdrop-blur-xl h-full ${plan.popular
                                ? 'bg-zinc-900/80 border-violet-500/50 shadow-2xl shadow-violet-500/10 scale-105'
                                : `bg-zinc-900/50 border-white/5 ${plan.borderHover}`
                                }`}>
                                {plan.popular && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(139,92,246,0.4)] z-20">
                                        Most Popular
                                    </div>
                                )}
                                {plan.savings && (
                                    <div className="absolute top-0 left-0 bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-3 py-1.5 rounded-br-2xl uppercase tracking-[0.15em] z-20 border-b border-r border-emerald-500/20">
                                        {plan.savings}
                                    </div>
                                )}

                                <CardHeader className="pb-2">
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center text-white mb-3 shadow-lg ${plan.shadow}`}>
                                        {plan.icon}
                                    </div>
                                    <CardTitle className="text-xl font-black uppercase tracking-tight text-white">{plan.name}</CardTitle>
                                    <CardDescription className="text-zinc-500 font-medium text-sm">{plan.duration} access</CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-5">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-white">₹{plan.price}</span>
                                        <span className="text-sm text-zinc-500 font-bold">/ {plan.duration.toLowerCase()}</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">≈ {plan.perDay}</p>

                                    <ul className="space-y-2.5 text-sm">
                                        {plan.features.map((feature, fi) => (
                                            <li key={fi} className="flex items-start gap-2 text-zinc-400 font-medium">
                                                <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-violet-400' : 'text-emerald-500'}`} />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>

                                <CardFooter className="pt-2">
                                    <Button
                                        onClick={() => handleSelectPlan(plan.id)}
                                        className={`w-full font-black uppercase tracking-[0.15em] h-12 transition-all hover:scale-[1.02] ${plan.popular
                                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-[0_0_30px_rgba(139,92,246,0.3)]'
                                            : 'bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300'
                                            }`}
                                    >
                                        Get Pro Features
                                    </Button>
                                </CardFooter>

                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-15 transition-opacity pointer-events-none">
                                    {React.cloneElement(plan.icon as any, { className: 'w-32 h-32' })}
                                </div>
                            </TiltCard>
                        </motion.div>
                    ))}
                </div>

                {/* Trust badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 pt-8"
                >
                    <span>🔒 Secure Payment</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span>⚡ Instant Activation</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span>📱 UPI / QR Supported</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span>✅ Manual Verification</span>
                </motion.div>
            </div>
        </div>
    )
}
