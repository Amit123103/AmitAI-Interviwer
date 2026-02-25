"use client";

import React from "react";

interface LogoProps {
    size?: number;        // px for the icon
    showText?: boolean;   // show "AMITAI" text next to icon
    showStatus?: boolean; // show green online dot
    className?: string;
}

export default function Logo({
    size = 36,
    showText = false,
    showStatus = false,
    className = "",
}: LogoProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Icon */}
            <div className="relative flex-shrink-0">
                <div
                    className="rounded-xl flex items-center justify-center"
                    style={{
                        width: size,
                        height: size,
                        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)",
                        boxShadow: "0 4px 20px rgba(124, 58, 237, 0.35), 0 0 40px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255,255,255,0.15)",
                    }}
                >
                    <span
                        className="font-extrabold text-white select-none"
                        style={{
                            fontSize: size * 0.38,
                            letterSpacing: "-0.02em",
                            lineHeight: 1,
                            textShadow: "0 1px 4px rgba(0,0,0,0.3)",
                        }}
                    >
                        AI
                    </span>
                </div>
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
