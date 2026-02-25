"use client"

import React from "react"
import { motion } from "framer-motion"
import { Target, CheckCircle2, Code2, FileText } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface TechnicalAccuracyGaugeProps {
    score: number // Overall 0-100
    keywordCoverage?: number // 0-100
    technicalDepth?: number // 0-100
    structureQuality?: number // 0-100
}

export function TechnicalAccuracyGauge({
    score,
    keywordCoverage = 0,
    technicalDepth = 0,
    structureQuality = 0
}: TechnicalAccuracyGaugeProps) {
    const getScoreColor = (value: number) => {
        if (value >= 80) return "text-green-500"
        if (value >= 60) return "text-blue-500"
        if (value >= 40) return "text-orange-500"
        return "text-red-500"
    }

    const getProgressColor = (value: number) => {
        if (value >= 80) return "bg-green-500"
        if (value >= 60) return "bg-blue-500"
        if (value >= 40) return "bg-orange-500"
        return "bg-red-500"
    }

    const metrics = [
        {
            label: "Keywords",
            value: keywordCoverage,
            icon: CheckCircle2,
            description: "Expected terms covered"
        },
        {
            label: "Technical Depth",
            value: technicalDepth,
            icon: Code2,
            description: "Technical detail level"
        },
        {
            label: "Structure",
            value: structureQuality,
            icon: FileText,
            description: "Answer organization"
        }
    ]

    return (
        <div className="bg-zinc-900/50 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm font-medium text-zinc-300">Technical Accuracy</span>
                </div>
            </div>

            {/* Overall Score */}
            <div className="text-center mb-4 pb-4 border-b border-white/5">
                <motion.div
                    className={`text-4xl font-black ${getScoreColor(score)}`}
                    key={score}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    {Math.round(score)}%
                </motion.div>
                <div className="text-xs text-zinc-500 mt-1">Overall Score</div>
            </div>

            {/* Detailed Metrics */}
            <div className="space-y-3">
                {metrics.map((metric, idx) => {
                    const Icon = metric.icon
                    return (
                        <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5">
                                    <Icon className="w-3.5 h-3.5 text-zinc-500" />
                                    <span className="text-zinc-400">{metric.label}</span>
                                </div>
                                <span className={`font-bold ${getScoreColor(metric.value)}`}>
                                    {Math.round(metric.value)}%
                                </span>
                            </div>

                            <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                    className={`absolute h-full ${getProgressColor(metric.value)} rounded-full`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${metric.value}%` }}
                                    transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.1 }}
                                />
                            </div>

                            <div className="text-xs text-zinc-600">{metric.description}</div>
                        </div>
                    )
                })}
            </div>

            {/* Performance Indicator */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Performance</span>
                    <span className={`font-medium ${getScoreColor(score)}`}>
                        {score >= 80 ? "Excellent" :
                            score >= 60 ? "Good" :
                                score >= 40 ? "Fair" : "Needs Improvement"}
                    </span>
                </div>
            </div>
        </div>
    )
}
