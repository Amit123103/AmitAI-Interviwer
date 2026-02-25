"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Minimize2, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfidenceMeter } from "./ConfidenceMeter"
import { FillerWordCounter } from "./FillerWordCounter"
import { SpeakingPaceIndicator } from "./SpeakingPaceIndicator"
import { TechnicalAccuracyGauge } from "./TechnicalAccuracyGauge"

export interface RealtimeFeedbackData {
    confidence: number
    fillerWords: {
        count: number
        rate: number
        recent: string[]
    }
    pace: {
        wpm: number
        history: number[]
    }
    accuracy: {
        score: number
        keywordCoverage: number
        technicalDepth: number
        structureQuality: number
    }
}

interface FeedbackOverlayProps {
    data: RealtimeFeedbackData
    isVisible?: boolean
    onToggle?: () => void
}

export function FeedbackOverlay({
    data,
    isVisible = true,
    onToggle
}: FeedbackOverlayProps) {
    const [isExpanded, setIsExpanded] = useState(true)
    const [isMinimized, setIsMinimized] = useState(false)

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`fixed right-0 top-20 bottom-0 z-40 ${isMinimized ? "w-16" : isExpanded ? "w-80" : "w-20"
                        } transition-all duration-300`}
                >
                    <div className="h-full bg-black/95 backdrop-blur-lg border-l border-white/10 shadow-2xl">
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            {!isMinimized && (
                                <h3 className="text-sm font-bold text-white">
                                    {isExpanded ? "Live Feedback" : "📊"}
                                </h3>
                            )}

                            <div className="flex items-center gap-1">
                                {/* Minimize/Maximize */}
                                <Button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 hover:bg-white/10"
                                >
                                    {isMinimized ? (
                                        <Maximize2 className="w-4 h-4" />
                                    ) : (
                                        <Minimize2 className="w-4 h-4" />
                                    )}
                                </Button>

                                {/* Expand/Collapse */}
                                {!isMinimized && (
                                    <Button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 hover:bg-white/10"
                                    >
                                        {isExpanded ? (
                                            <ChevronRight className="w-4 h-4" />
                                        ) : (
                                            <ChevronLeft className="w-4 h-4" />
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        {!isMinimized && (
                            <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-60px)]">
                                {isExpanded ? (
                                    <>
                                        {/* Confidence Meter */}
                                        <div className="flex justify-center">
                                            <ConfidenceMeter
                                                score={data.confidence}
                                                size="md"
                                                showLabel={true}
                                            />
                                        </div>

                                        {/* Filler Words */}
                                        <FillerWordCounter
                                            count={data.fillerWords.count}
                                            rate={data.fillerWords.rate}
                                            recentFillers={data.fillerWords.recent}
                                        />

                                        {/* Speaking Pace */}
                                        <SpeakingPaceIndicator
                                            wpm={data.pace.wpm}
                                            history={data.pace.history}
                                        />

                                        {/* Technical Accuracy */}
                                        <TechnicalAccuracyGauge
                                            score={data.accuracy.score}
                                            keywordCoverage={data.accuracy.keywordCoverage}
                                            technicalDepth={data.accuracy.technicalDepth}
                                            structureQuality={data.accuracy.structureQuality}
                                        />
                                    </>
                                ) : (
                                    // Compact view
                                    <div className="space-y-3">
                                        <div className="flex justify-center">
                                            <ConfidenceMeter
                                                score={data.confidence}
                                                size="sm"
                                                showLabel={false}
                                            />
                                        </div>

                                        <div className="space-y-2 text-center">
                                            <div>
                                                <div className="text-xs text-zinc-500">Fillers</div>
                                                <div className="text-lg font-bold">{data.fillerWords.count}</div>
                                            </div>

                                            <div>
                                                <div className="text-xs text-zinc-500">WPM</div>
                                                <div className="text-lg font-bold">{data.pace.wpm}</div>
                                            </div>

                                            <div>
                                                <div className="text-xs text-zinc-500">Accuracy</div>
                                                <div className="text-lg font-bold">{Math.round(data.accuracy.score)}%</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Minimized Icon Bar */}
                        {isMinimized && (
                            <div className="p-2 space-y-4 text-center">
                                <div className="text-2xl">📊</div>
                                <div className="text-xs text-zinc-500 rotate-90 whitespace-nowrap origin-center">
                                    Feedback
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
