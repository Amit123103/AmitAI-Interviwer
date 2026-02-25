"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronRight, Home } from "lucide-react"
import Link from "next/link"

interface BreadcrumbItem {
    label: string
    href?: string
}

interface DashboardHeaderProps {
    title: string
    subtitle?: string
    icon?: React.ReactNode
    showBack?: boolean
    backHref?: string
    breadcrumbs?: BreadcrumbItem[]
}

export default function DashboardHeader({
    title,
    subtitle,
    icon,
    showBack = true,
    backHref,
    breadcrumbs = []
}: DashboardHeaderProps) {
    const router = useRouter()

    const handleBack = () => {
        if (backHref) {
            router.push(backHref)
        } else {
            router.back()
        }
    }

    return (
        <div className="space-y-4 mb-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs font-medium text-zinc-500 overflow-x-auto whitespace-nowrap pb-2 sm:pb-0">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-1 hover:text-white transition-colors"
                >
                    <Home className="w-3 h-3" />
                    <span>Dashboard</span>
                </Link>

                {breadcrumbs.map((item, index) => (
                    <React.Fragment key={index}>
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="hover:text-white transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-zinc-300">{item.label}</span>
                        )}
                    </React.Fragment>
                ))}
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative group">
                {/* HUD Decorative Brackets */}
                <div className="absolute -left-4 -top-2 w-8 h-8 border-l-2 border-t-2 border-primary/20 pointer-events-none group-hover:border-primary/40 transition-colors" />
                <div className="absolute -right-4 -bottom-2 w-8 h-8 border-r-2 border-b-2 border-primary/20 pointer-events-none group-hover:border-primary/40 transition-colors" />

                <div className="flex items-center gap-4 relative">
                    {showBack && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleBack}
                            className="bg-zinc-950 border-white/10 hover:bg-white/5 h-10 w-10 shrink-0 relative overflow-hidden group/back"
                        >
                            <div className="absolute inset-0 bg-primary/0 group-hover/back:bg-primary/5 transition-colors" />
                            <ArrowLeft className="w-5 h-5 relative z-10" />
                        </Button>
                    )}
                    <div className="min-w-0">
                        <div className="flex items-center gap-3">
                            {icon && (
                                <div className="text-primary shrink-0 relative">
                                    <div className="absolute inset-0 blur-lg bg-primary/20 animate-pulse" />
                                    {icon}
                                </div>
                            )}
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight truncate bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent">
                                {title}
                            </h1>
                        </div>
                        {subtitle && (
                            <div className="relative">
                                <p className="text-sm text-zinc-400 mt-1 truncate max-w-xl">
                                    {subtitle}
                                </p>
                                <div className="absolute -bottom-1 left-0 w-24 h-[1px] bg-gradient-to-r from-primary/40 to-transparent" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
