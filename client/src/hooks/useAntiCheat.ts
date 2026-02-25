"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Socket } from "socket.io-client";

// ────────────────────────────────────────────────────────────────────
// useAntiCheat
// Detects tab switching, paste attempts, and virtual audio devices
// during an active interview session. Emits violations to the server.
// ────────────────────────────────────────────────────────────────────

interface AntiCheatOptions {
    /** Socket.IO connection for reporting violations */
    socket: Socket | null;
    /** Whether the interview is currently active */
    isActive: boolean;
    /** Session/interview ID for logging */
    sessionId?: string;
    /** Callback when a violation is detected */
    onViolation?: (type: string, detail: string) => void;
}

interface ViolationCounts {
    tabSwitch: number;
    paste: number;
    virtualAudio: number;
}

const VIRTUAL_AUDIO_KEYWORDS = [
    "virtual", "voicemeeter", "obs", "soundflower", "blackhole",
    "stereo mix", "cable input", "cable output", "vb-audio",
    "loopback", "screen capture", "what u hear",
];

export function useAntiCheat({
    socket,
    isActive,
    sessionId,
    onViolation,
}: AntiCheatOptions) {
    const violations = useRef<ViolationCounts>({
        tabSwitch: 0,
        paste: 0,
        virtualAudio: 0,
    });

    // ── Report a violation ─────────────────────────────────────────
    const report = useCallback(
        (type: string, detail: string) => {
            if (!isActive) return;

            // Update counter
            const key = type as keyof ViolationCounts;
            if (key in violations.current) {
                violations.current[key]++;
            }

            // Notify server
            if (socket?.connected) {
                socket.emit("anti-cheat:violation", {
                    type,
                    detail,
                    sessionId,
                    timestamp: Date.now(),
                    counts: { ...violations.current },
                });
            }

            // Notify local callback
            onViolation?.(type, detail);
        },
        [isActive, socket, sessionId, onViolation]
    );

    // ── 1. Tab / Window switch detection ───────────────────────────
    useEffect(() => {
        if (!isActive) return;

        const handleVisibility = () => {
            if (document.hidden) {
                report("tabSwitch", "User switched away from interview tab");
            }
        };

        const handleBlur = () => {
            report("tabSwitch", "Browser window lost focus");
        };

        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("blur", handleBlur);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("blur", handleBlur);
        };
    }, [isActive, report]);

    // ── 2. Paste prevention ────────────────────────────────────────
    useEffect(() => {
        if (!isActive) return;

        const handlePaste = (e: ClipboardEvent) => {
            e.preventDefault();
            report("paste", "Paste attempt blocked during interview");
        };

        document.addEventListener("paste", handlePaste, true);
        return () => document.removeEventListener("paste", handlePaste, true);
    }, [isActive, report]);

    // ── 3. Virtual audio device detection ──────────────────────────
    useEffect(() => {
        if (!isActive) return;

        const checkAudioDevices = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const audioInputs = devices.filter((d) => d.kind === "audioinput");

                for (const device of audioInputs) {
                    const label = (device.label || "").toLowerCase();
                    const isVirtual = VIRTUAL_AUDIO_KEYWORDS.some((kw) =>
                        label.includes(kw)
                    );
                    if (isVirtual) {
                        report(
                            "virtualAudio",
                            `Virtual audio device detected: ${device.label}`
                        );
                    }
                }
            } catch {
                // Permissions denied — cannot enumerate, move on
            }
        };

        checkAudioDevices();
        // Re-check every 30 seconds in case devices change
        const interval = setInterval(checkAudioDevices, 30_000);
        return () => clearInterval(interval);
    }, [isActive, report]);

    return {
        /** Current violation counts */
        violations: violations.current,
        /** Reset counters (e.g. on new interview) */
        reset: () => {
            violations.current = { tabSwitch: 0, paste: 0, virtualAudio: 0 };
        },
    };
}
