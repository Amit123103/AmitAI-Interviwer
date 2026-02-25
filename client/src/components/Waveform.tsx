"use client"

import React, { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface WaveformProps {
    volume: number
    isRecording: boolean
    className?: string
    color?: string
}

export default function Waveform({ volume, isRecording, className = "", color = "#22c55e" }: WaveformProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const bars = 40
    const historyRef = useRef<number[]>(new Array(bars).fill(2))

    useEffect(() => {
        if (!isRecording) {
            historyRef.current = new Array(bars).fill(2)
            draw()
            return
        }

        // Add current volume to history
        const normalizedVolume = Math.max(2, (volume / 100) * 40)
        historyRef.current.push(normalizedVolume)
        if (historyRef.current.length > bars) {
            historyRef.current.shift()
        }

        draw()
    }, [volume, isRecording])

    const draw = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const width = canvas.width
        const height = canvas.height
        const barWidth = width / bars
        const centerY = height / 2

        ctx.clearRect(0, 0, width, height)

        historyRef.current.forEach((val, i) => {
            const x = i * barWidth
            const h = val

            // Draw bar with gradient
            const gradient = ctx.createLinearGradient(x, centerY - h / 2, x, centerY + h / 2)
            gradient.addColorStop(0, color + '44')
            gradient.addColorStop(0.5, color)
            gradient.addColorStop(1, color + '44')

            ctx.fillStyle = gradient

            // Rounded rect for bar
            const radius = 2
            const bx = x + 1
            const bw = barWidth - 2
            const by = centerY - h / 2

            ctx.beginPath()
            ctx.moveTo(bx + radius, by)
            ctx.lineTo(bx + bw - radius, by)
            ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + radius)
            ctx.lineTo(bx + bw, by + h - radius)
            ctx.quadraticCurveTo(bx + bw, by + h, bx + bw - radius, by + h)
            ctx.lineTo(bx + radius, by + h)
            ctx.quadraticCurveTo(bx, by + h, bx, by + h - radius)
            ctx.lineTo(bx, by + radius)
            ctx.quadraticCurveTo(bx, by, bx + radius, by)
            ctx.closePath()
            ctx.fill()
        })
    }

    return (
        <div className={`relative ${className}`}>
            <canvas
                ref={canvasRef}
                width={300}
                height={60}
                className="w-full h-full"
            />
            {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-0.5 w-full bg-zinc-800 rounded-full" />
                </div>
            )}
        </div>
    )
}
