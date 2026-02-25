"use client"

import React, { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion"

export default function CyberCursor() {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const springConfig = { damping: 25, stiffness: 200 }
    const cursorX = useSpring(mouseX, springConfig)
    const cursorY = useSpring(mouseY, springConfig)

    const [isPointer, setIsPointer] = useState(false)
    const [isClicked, setIsClicked] = useState(false)
    const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX)
            mouseY.set(e.clientY)

            const target = e.target as HTMLElement
            setIsPointer(window.getComputedStyle(target).cursor === "pointer")

            // Add trail particle
            if (Math.random() > 0.8) {
                const id = Date.now()
                setParticles(prev => [...prev.slice(-15), { id, x: e.clientX, y: e.clientY }])
                setTimeout(() => {
                    setParticles(prev => prev.filter(p => p.id !== id))
                }, 1000)
            }
        }

        const handleMouseDown = () => setIsClicked(true)
        const handleMouseUp = () => setIsClicked(false)

        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("mousedown", handleMouseDown)
        window.addEventListener("mouseup", handleMouseUp)

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("mousedown", handleMouseDown)
            window.removeEventListener("mouseup", handleMouseUp)
        }
    }, [mouseX, mouseY])

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] hidden lg:block">
            {/* Trail Particles */}
            <AnimatePresence>
                {particles.map(p => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0.5, scale: 1 }}
                        animate={{ opacity: 0, scale: 0, y: p.y + 20 }}
                        exit={{ opacity: 0 }}
                        className="absolute w-1 h-1 bg-primary/40 rounded-full"
                        style={{ left: p.x, top: p.y }}
                    />
                ))}
            </AnimatePresence>

            {/* Main Cursor Ring */}
            <motion.div
                className="absolute w-8 h-8 border border-primary/40 rounded-full flex items-center justify-center"
                style={{
                    left: cursorX,
                    top: cursorY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                animate={{
                    scale: isClicked ? 0.8 : isPointer ? 1.5 : 1,
                    borderColor: isPointer ? "rgba(var(--primary), 1)" : "rgba(var(--primary), 0.4)",
                    borderWidth: isPointer ? "2px" : "1px",
                }}
            />

            {/* Orbital Dot */}
            <motion.div
                className="absolute w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.8)]"
                style={{
                    left: cursorX,
                    top: cursorY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                animate={{
                    x: isPointer ? [20, -20, 20] : [15, -15, 15],
                    y: isPointer ? [-20, 20, -20] : [-15, 15, -15],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />

            {/* Central Crosshair */}
            <motion.div
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                    left: cursorX,
                    top: cursorY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
            />
        </div>
    )
}
