"use client"

import React, { useEffect } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

export default function HolographicHud() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {/* Dynamic HUD Elements */}
            <div className="absolute top-1/2 left-8 -translate-y-1/2 flex flex-col gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                    <motion.div
                        key={`tick_l_${i}`}
                        className="h-px bg-primary/20 will-change-transform"
                        style={{ width: i % 5 === 0 ? 12 : 6 }}
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                    />
                ))}
            </div>

            <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col items-end gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                    <motion.div
                        key={`tick_r_${i}`}
                        className="h-px bg-primary/20 will-change-transform"
                        style={{ width: i % 5 === 0 ? 12 : 6 }}
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                    />
                ))}
            </div>

            {/* Scanning Line */}
            <motion.div
                className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent will-change-[top]"
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />

            {/* Static HUD Text Overlay */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary/5 border border-primary/20 backdrop-blur-md rounded-full">
                <span className="text-[8px] font-black text-primary/60 uppercase tracking-[0.5em] animate-pulse">
                    Advanced Logic System // Online
                </span>
            </div>
        </div>
    )
}
