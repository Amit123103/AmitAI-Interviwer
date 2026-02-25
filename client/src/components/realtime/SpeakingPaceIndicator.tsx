"use client"

import React from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus, Gauge } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SpeakingPaceIndicatorProps {
    wpm: number
    optimalRange?: [number, number]
    history?: number[] // last 10 readings
}

export function SpeakingPaceIndicator({
    wpm,
    optimalRange = [130, 170],
    history = []
}: SpeakingPaceIndicatorProps) {
    const [minWpm, maxWpm] = optimalRange
    const isOptimal = wpm >= minWpm && wpm <= maxWpm
    const isTooSlow = wpm < minWpm
    const isTooFast = wpm > maxWpm

    // Determine trend from history
    const getTrend = () => {
        if (history.length < 2) return "stable"
        const recent = history.slice(-3)
        const avg = recent.reduce((a, b) => a + b, 0) / recent.length
        if (wpm > avg + 5) return "up"
        if (wpm < avg - 5) return "down"
        return "stable"
    }

    const trend = getTrend()
    const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

    const getColor = () => {
        if (isOptimal) return "text-green-500"
        if (isTooSlow) return "text-blue-500"
        return "text-orange-500"
    }

    const getStatus = () => {
        if (isOptimal) return "Optimal"
        if (isTooSlow) return "Too Slow"
        return "Too Fast"
    }

    const color = getColor()

    return (
        <div className="bg-zinc-900/50 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm font-medium text-zinc-300">Speaking Pace</span>
                </div>
                <Badge
                    variant="outline"
                    className={`${isOptimal
                            ? "border-green-500/50 text-green-500"
                            : isTooSlow
                                ? "border-blue-500/50 text-blue-500"
                                : "border-orange-500/50 text-orange-500"
                        } text-xs`}
                >
                    {getStatus()}
                </Badge>
            </div>

            {/* WPM Display */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <motion.div
                        className={`text-3xl font-bold ${color}`}
                        key={wpm}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {wpm}
                    </motion.div>
                    <div className="text-xs text-zinc-500">words per minute</div>
                </div>

                {/* Trend Indicator */}
                <div className="flex flex-col items-center">
                    <TrendIcon className={`w-6 h-6 ${trend === "up" ? "text-orange-500" :
                            trend === "down" ? "text-blue-500" :
                                "text-zinc-500"
                        }`} />
                    <div className="text-xs text-zinc-500 capitalize">{trend}</div>
                </div>
            </div>

            {/* Optimal Range Visualization */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Slow</span>
                    <span>Optimal</span>
                    <span>Fast</span>
                </div>

                <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
                    {/* Optimal range highlight */}
                    <div
                        className="absolute h-full bg-green-500/20"
                        style={{
                            left: `${(minWpm / 200) * 100}%`,
                            width: `${((maxWpm - minWpm) / 200) * 100}%`
                        }}
                    />

                    {/* Current position indicator */}
                    <motion.div
                        className={`absolute h-full w-1 ${color.replace('text-', 'bg-')}`}
                        initial={{ left: 0 }}
                        animate={{ left: `${Math.min((wpm / 200) * 100, 100)}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>0</span>
                    <span className="text-green-500">{minWpm}-{maxWpm}</span>
                    <span>200+</span>
                </div>
            </div>

            {/* Mini History Chart */}
            {history.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="text-xs text-zinc-500 mb-2">Recent Pace</div>
                    <div className="flex items-end gap-1 h-8">
                        {history.slice(-10).map((value, idx) => {
                            const height = Math.min((value / 200) * 100, 100)
                            const isInRange = value >= minWpm && value <= maxWpm
                            return (
                                <motion.div
                                    key={idx}
                                    className={`flex-1 rounded-t ${isInRange ? "bg-green-500/30" : "bg-zinc-700"
                                        }`}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
