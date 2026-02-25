"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft, Home, ChevronRight } from "lucide-react"

interface BackToDashboardProps {
    /** Current page label shown in breadcrumb */
    currentPage: string
    /** Optional parent breadcrumb items */
    parents?: { label: string; href: string }[]
}

export default function BackToDashboard({ currentPage, parents = [] }: BackToDashboardProps) {
    return (
        <nav className="flex items-center gap-2 mb-6 relative z-10">
            <Link
                href="/dashboard"
                className="flex items-center gap-2 text-zinc-500 hover:text-violet-400 transition-all group"
            >
                <div className="w-8 h-8 rounded-lg bg-zinc-900/60 backdrop-blur-xl border border-white/[0.06] flex items-center justify-center group-hover:border-violet-500/20 group-hover:shadow-[0_0_12px_rgba(139,92,246,0.1)] transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                    <Home className="w-3 h-3" />
                    <span>Dashboard</span>
                </div>
            </Link>
            {parents.map((p, i) => (
                <React.Fragment key={i}>
                    <ChevronRight className="w-3 h-3 text-zinc-700" />
                    <Link href={p.href} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-violet-400 transition-colors">
                        {p.label}
                    </Link>
                </React.Fragment>
            ))}
            <ChevronRight className="w-3 h-3 text-zinc-700" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">{currentPage}</span>
        </nav>
    )
}
