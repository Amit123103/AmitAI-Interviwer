// Real-time feedback API integration service

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000"

export interface AudioFeatures {
    volume?: number
    pitch?: number
    energy?: number
}

export interface RealtimeFeedback {
    confidence: number
    fillerWords: {
        count: number
        rate: number
        detected: string[]
    }
    pace: {
        wpm: number
        status: "too_slow" | "optimal" | "too_fast"
    }
    clarity: {
        score: number
        issues: string[]
    }
    feedback: string[]
}

export interface PerformanceScore {
    overall: number
    responseQuality: {
        keywordScore: number
        technicalDepth: number
        lengthScore: number
        structureScore: number
    }
    confidence: number
    responseSpeed: {
        timeTaken: number
        rating: string
    }
    weakAreas: string[]
    feedback: string[]
}

/**
 * Analyze speech in real-time
 */
export async function analyzeRealtime(
    transcript: string,
    duration: number,
    audioFeatures: AudioFeatures = {}
): Promise<RealtimeFeedback> {
    try {
        const response = await fetch(`${AI_SERVICE_URL}/adaptive/realtime-feedback`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                transcript,
                duration,
                audio_features: audioFeatures,
            }),
        })

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error("Real-time feedback error:", error)
        // Return default values on error
        return {
            confidence: 0,
            fillerWords: { count: 0, rate: 0, detected: [] },
            pace: { wpm: 0, status: "optimal" },
            clarity: { score: 0, issues: [] },
            feedback: ["Unable to analyze speech at this time"],
        }
    }
}

/**
 * Score a complete response
 */
export async function scoreResponse(
    answer: string,
    questionType: string = "technical",
    expectedKeywords: string[] = []
): Promise<PerformanceScore> {
    try {
        const response = await fetch(`${AI_SERVICE_URL}/adaptive/score-response`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                answer,
                expected_keywords: expectedKeywords,
                question_type: questionType,
                audio_features: {},
                time_taken: 0,
            }),
        })

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error("Score response error:", error)
        return {
            overall: 0,
            responseQuality: {
                keywordScore: 0,
                technicalDepth: 0,
                lengthScore: 0,
                structureScore: 0,
            },
            confidence: 0,
            responseSpeed: {
                timeTaken: 0,
                rating: "unknown",
            },
            weakAreas: [],
            feedback: ["Unable to score response at this time"],
        }
    }
}

/**
 * Get next adaptive question
 */
export async function getNextQuestion(
    sessionId: string,
    currentLevel: string = "medium",
    topic: string = "general",
    weakAreas: string[] = []
) {
    try {
        const response = await fetch(`${AI_SERVICE_URL}/adaptive/next-question`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                session_id: sessionId,
                current_level: currentLevel,
                topic,
                weak_areas: weakAreas,
            }),
        })

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error("Get next question error:", error)
        return null
    }
}

/**
 * Get performance summary for a session
 */
export async function getPerformanceSummary(sessionId: string) {
    try {
        const response = await fetch(`${AI_SERVICE_URL}/adaptive/performance-summary/${sessionId}`)

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error("Get performance summary error:", error)
        return null
    }
}

/**
 * Clean up session data
 */
export async function cleanupSession(sessionId: string) {
    try {
        const response = await fetch(`${AI_SERVICE_URL}/adaptive/session/${sessionId}`, {
            method: "DELETE",
        })

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error("Cleanup session error:", error)
        return null
    }
}

/**
 * Debounce function for limiting API calls
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null
            func(...args)
        }

        if (timeout) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(later, wait)
    }
}

/**
 * WebSocket connection for continuous feedback (future enhancement)
 */
export function connectFeedbackStream(
    sessionId: string,
    onUpdate: (feedback: RealtimeFeedback) => void
): WebSocket | null {
    try {
        const ws = new WebSocket(`ws://localhost:8000/adaptive/stream/${sessionId}`)

        ws.onmessage = (event) => {
            const feedback = JSON.parse(event.data)
            onUpdate(feedback)
        }

        ws.onerror = (error) => {
            console.error("WebSocket error:", error)
        }

        return ws
    } catch (error) {
        console.error("WebSocket connection error:", error)
        return null
    }
}
