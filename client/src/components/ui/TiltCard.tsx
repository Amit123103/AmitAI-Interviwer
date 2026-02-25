"use client"

import React, { useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform, HTMLMotionProps } from "framer-motion"

interface TiltCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode
    className?: string
}

export default function TiltCard({ children, className = "", ...props }: TiltCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)

    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const springConfig = { damping: 20, stiffness: 150 }
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig)
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        mouseX.set(x)
        mouseY.set(y)
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
        mouseX.set(0)
        mouseY.set(0)
    }

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={`relative ${className}`}
            {...props}
        >
            <div style={{ transform: "translateZ(30px)" }}>
                {children}
            </div>

            {/* Depth Shine Effect */}
            {isHovered && (
                <motion.div
                    className="absolute inset-0 z-10 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(255,255,255,0.05)_0%,transparent_50%)]"
                    style={{
                        // @ts-ignore
                        "--x": `${(mouseX.get() + 0.5) * 100}%`,
                        // @ts-ignore
                        "--y": `${(mouseY.get() + 0.5) * 100}%`,
                    }}
                />
            )}
        </motion.div>
    )
}
