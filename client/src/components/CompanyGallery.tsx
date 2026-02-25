"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Sparkles } from "lucide-react"

const companies = [
    { name: "Google", color: "from-blue-500 to-red-500", glow: "rgba(59,130,246,0.3)", icon: "G" },
    { name: "Amazon", color: "from-orange-500 to-amber-700", glow: "rgba(249,115,22,0.3)", icon: "A" },
    { name: "Meta", color: "from-blue-600 to-cyan-400", glow: "rgba(37,99,235,0.3)", icon: "M" },
    { name: "Netflix", color: "from-red-600 to-rose-800", glow: "rgba(220,38,38,0.3)", icon: "N" },
    { name: "Microsoft", color: "from-blue-500 to-emerald-500", glow: "rgba(59,130,246,0.3)", icon: "M" },
    { name: "Apple", color: "from-zinc-400 to-zinc-700", glow: "rgba(161,161,170,0.2)", icon: "A" },
]

export default function CompanyGallery({ selected, onSelect }: { selected: string, onSelect: (name: string) => void }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {companies.map((company, i) => (
                <motion.div
                    key={company.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    whileHover={{ scale: 1.04, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onSelect(company.name === selected ? "" : company.name)}
                    className="cursor-pointer"
                >
                    <Card className={`relative overflow-hidden border transition-all duration-300 rounded-2xl backdrop-blur-2xl ${selected === company.name
                        ? `border-violet-500/30 bg-violet-500/5 shadow-[0_0_30px_${company.glow}]`
                        : "border-white/[0.06] bg-zinc-900/40 hover:border-white/[0.12] hover:bg-zinc-900/60"
                        }`}>
                        {/* Gradient top line */}
                        <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent ${selected === company.name ? 'via-violet-500/60' : 'via-white/[0.06]'} to-transparent transition-all`} />

                        <CardContent className="p-6 flex flex-col items-center gap-3.5 relative">
                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${company.color} flex items-center justify-center text-xl font-black text-white shadow-lg relative transition-all ${selected === company.name ? 'shadow-[0_0_25px_' + company.glow + '] scale-110' : ''}`}>
                                {company.icon}
                                {selected === company.name && (
                                    <div className="absolute -inset-1 rounded-2xl border border-violet-400/30 animate-ping opacity-40" />
                                )}
                            </div>

                            {/* Name */}
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${selected === company.name ? 'bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent' : 'text-zinc-400'}`}>
                                {company.name}
                            </span>

                            {/* Selected check */}
                            {selected === company.name && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -90 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="absolute top-2.5 right-2.5 w-6 h-6 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                                >
                                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    )
}
