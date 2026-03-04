"use client";

import React from "react";
import { motion } from "framer-motion";

interface LogoProps {
    size?: number;        // px for the icon
    showText?: boolean;   // show "AMITAI" text next to icon
    showStatus?: boolean; // show green online dot
    className?: string;
    animate?: boolean;    // enable advanced hover/floating animations
}

export default function Logo({
    size = 36,
    showText = false,
    showStatus = false,
    className = "",
    animate = true,
}: LogoProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Icon */}
            <div className="relative flex-shrink-0">
                {/* Advanced glow behind the logo */}
                {animate && (
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.4, 0.7, 0.4],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-xl rounded-full"
                        style={{ width: size, height: size }}
                    />
                )}

                <motion.img
                    animate={animate ? {
                        y: [-2, 2, -2],
                    } : {}}
                    whileHover={animate ? {
                        scale: 1.05,
                        rotate: [0, -5, 5, 0],
                        filter: "drop-shadow(0px 0px 20px rgba(139,92,246,0.8))"
                    } : {}}
                    transition={{
                        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 0.5 },
                        scale: { duration: 0.2 }
                    }}
                    src="/assets/logo-3d.png"
                    alt="AMITAI Interviewer Logo"
                    className="relative z-10 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] cursor-pointer"
                    style={{
                        width: size,
                        height: size,
                    }}
                />
                {/* Online status dot */}
                {showStatus && (
                    <div
                        className="absolute rounded-full ring-2 ring-zinc-950"
                        style={{
                            width: size * 0.22,
                            height: size * 0.22,
                            bottom: -size * 0.04,
                            right: -size * 0.04,
                            background: "linear-gradient(135deg, #10b981, #34d399)",
                            boxShadow: "0 0 8px rgba(16, 185, 129, 0.5)",
                        }}
                    />
                )}
            </div>

            {/* Text */}
            {showText && (
                <div className="flex flex-col leading-none">
                    <span
                        className="font-extrabold tracking-tight select-none"
                        style={{
                            fontSize: size * 0.44,
                            background: "linear-gradient(135deg, #c7d2fe 0%, #a78bfa 40%, #e879f9 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        AMITAI
                    </span>
                    <span
                        className="text-zinc-400 font-medium tracking-wide"
                        style={{ fontSize: size * 0.26, marginTop: size * 0.06 }}
                    >
                        Interview
                    </span>
                </div>
            )}
        </div>
    );
}
