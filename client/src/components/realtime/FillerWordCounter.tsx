"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface FillerWordCounterProps {
    count: number
    rate: number // per minute
    recentFillers: string[]
    threshold?: number
}

export function FillerWordCounter({
    count,
    rate,
    recentFillers,
    threshold = 5
}: FillerWordCounterProps) {
    const isAboveThreshold = count > threshold
    const rateColor = rate > 3 ? "text-red-500" : rate > 1.5 ? "text-orange-500" : "text-green-500"

    return (
        <div className="bg-zinc-900/50 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <AlertCircle className={`w-4 h-4 ${isAboveThreshold ? "text-orange-500" : "text-zinc-500"}`} />
                    <span className="text-sm font-medium text-zinc-300">Filler Words</span>
                </div>
                {isAboveThreshold && (
                    <Badge variant="outline" className="border-orange-500/50 text-orange-500 text-xs">
                        Above Threshold
                    </Badge>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
                {/* Total Count */}
                <div>
                    <div className="text-xs text-zinc-500 mb-1">Total Count</div>
                    <motion.div
                        className="text-2xl font-bold"
                        key={count}
                        initial={{ scale: 1.2, color: "#f97316" }}
                        animate={{ scale: 1, color: "#ffffff" }}
                        transition={{ duration: 0.3 }}
                    >
                        {count}
                    </motion.div>
                </div>

                {/* Rate */}
                <div>
                    <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Rate/min
                    </div>
                    <div className={`text-2xl font-bold ${rateColor}`}>
                        {rate.toFixed(1)}
                    </div>
                </div>
            </div>

            {/* Recent Fillers */}
            {recentFillers.length > 0 && (
                <div>
                    <div className="text-xs text-zinc-500 mb-2">Recent Detections</div>
                    <div className="flex flex-wrap gap-1">
                        <AnimatePresence mode="popLayout">
                            {recentFillers.slice(0, 6).map((filler, idx) => (
                                <motion.div
                                    key={`${filler}-${idx}`}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Badge
                                        variant="secondary"
                                        className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-xs"
                                    >
                                        {filler}
                                    </Badge>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Threshold Indicator */}
            <div className="mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Threshold: {threshold}</span>
                    <span className={count <= threshold ? "text-green-500" : "text-orange-500"}>
                        {count <= threshold ? "✓ Within limit" : "⚠ Exceeds limit"}
                    </span>
                </div>
            </div>
        </div>
    )
}
