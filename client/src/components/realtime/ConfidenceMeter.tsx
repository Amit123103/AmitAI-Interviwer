"use client"

import React from "react"
import { motion } from "framer-motion"

interface ConfidenceMeterProps {
    score: number // 0-100
    size?: "sm" | "md" | "lg"
    showLabel?: boolean
}

const SIZES = {
    sm: { width: 80, stroke: 6, fontSize: "text-lg" },
    md: { width: 120, stroke: 8, fontSize: "text-2xl" },
    lg: { width: 160, stroke: 10, fontSize: "text-3xl" }
}

export function ConfidenceMeter({
    score,
    size = "md",
    showLabel = true
}: ConfidenceMeterProps) {
    const { width, stroke, fontSize } = SIZES[size]
    const radius = (width - stroke) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference

    // Color based on score
    const getColor = () => {
        if (score >= 75) return { bg: "text-green-500", ring: "stroke-green-500" }
        if (score >= 50) return { bg: "text-blue-500", ring: "stroke-blue-500" }
        if (score >= 25) return { bg: "text-orange-500", ring: "stroke-orange-500" }
        return { bg: "text-red-500", ring: "stroke-red-500" }
    }

    const colors = getColor()

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width, height: width }}>
                {/* Background circle */}
                <svg className="transform -rotate-90" width={width} height={width}>
                    <circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={stroke}
                        fill="none"
                        className="text-zinc-800"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={stroke}
                        fill="none"
                        strokeLinecap="round"
                        className={colors.ring}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        style={{
                            strokeDasharray: circumference,
                            strokeDashoffset: offset
                        }}
                    />
                </svg>

                {/* Score text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                        className={`font-bold ${fontSize} ${colors.bg}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {Math.round(score)}%
                    </motion.span>
                </div>
            </div>

            {showLabel && (
                <div className="text-center">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Confidence</div>
                    <div className={`text-sm font-medium ${colors.bg}`}>
                        {score >= 75 ? "Excellent" : score >= 50 ? "Good" : score >= 25 ? "Fair" : "Low"}
                    </div>
                </div>
            )}
        </div>
    )
}
