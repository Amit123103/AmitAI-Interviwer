import React from 'react';
import { motion } from 'framer-motion';

interface AmitAICoinProps {
    size?: number;
    className?: string;
    glow?: boolean;
    animate?: boolean;
    speed?: number; // rotation speed in seconds (default 4)
}

const AmitAICoin: React.FC<AmitAICoinProps> = ({
    size = 40,
    className = "",
    glow = true,
    animate = true,
    speed = 4
}) => {
    return (
        <div
            className={`relative flex items-center justify-center ${className}`}
            style={{ perspective: '1000px' }}
        >
            {/* Outer Glow Effect */}
            {glow && (
                <motion.div
                    animate={animate ? {
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.5, 0.2],
                    } : {}}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute rounded-full"
                    style={{
                        width: size * 1.6,
                        height: size * 1.6,
                        background: 'radial-gradient(circle, rgba(234,179,8,0.35) 0%, rgba(245,158,11,0.15) 50%, transparent 70%)',
                        filter: 'blur(12px)',
                    }}
                />
            )}

            {/* Orbiting Particles Ring */}
            {animate && glow && (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: speed * 2,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute z-0"
                    style={{
                        width: size * 1.6,
                        height: size * 1.6,
                    }}
                >
                    {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                opacity: [0.3, 1, 0.3],
                                scale: [0.6, 1.2, 0.6],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3,
                                ease: "easeInOut"
                            }}
                            className="absolute"
                            style={{
                                width: size * 0.08,
                                height: size * 0.08,
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, #fbbf24, #f59e0b)',
                                boxShadow: '0 0 6px rgba(251,191,36,0.8)',
                                top: '50%',
                                left: '50%',
                                transform: `rotate(${deg}deg) translateX(${size * 0.8}px) translateY(-50%)`,
                            }}
                        />
                    ))}
                </motion.div>
            )}

            {/* Golden Rim Pulse */}
            {animate && (
                <motion.div
                    animate={{
                        boxShadow: [
                            `0 0 0px 0px rgba(234,179,8,0)`,
                            `0 0 15px 3px rgba(234,179,8,0.4)`,
                            `0 0 0px 0px rgba(234,179,8,0)`,
                        ],
                    }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute rounded-full z-[5]"
                    style={{
                        width: size,
                        height: size,
                    }}
                />
            )}

            {/* The Coin Image Container - 3D Y-axis rotation */}
            <motion.div
                animate={animate ? {
                    rotateY: [0, 360],
                } : {}}
                transition={{
                    duration: speed,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="relative z-10"
                style={{
                    width: size,
                    height: size,
                    transformStyle: 'preserve-3d'
                }}
            >
                {/* Front Face */}
                <img
                    src="/assets/amitai-coin-3d.png"
                    alt="AmitAI Coin Front"
                    className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                    style={{ backfaceVisibility: 'hidden' }}
                />

                {/* Back Face (rotated 180deg to avoid mirrored text) */}
                <img
                    src="/assets/amitai-coin-3d.png"
                    alt="AmitAI Coin Back"
                    className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                    style={{
                        transform: 'rotateY(180deg)',
                        backfaceVisibility: 'hidden'
                    }}
                />

                {/* Shine Sweep Effect */}
                {animate && (
                    <motion.div
                        animate={{
                            left: ['-100%', '200%'],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1,
                            ease: "easeInOut"
                        }}
                        className="absolute top-0 bottom-0 w-1/2 bg-white/25 -skew-x-12 blur-sm pointer-events-none z-20"
                        style={{ transform: 'translateZ(1px)' }}
                    />
                )}
            </motion.div>
        </div>
    );
};

export default AmitAICoin;
