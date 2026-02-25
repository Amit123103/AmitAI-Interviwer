/// <reference path="../types/express.d.ts" />
import express from 'express'
import { protect } from '../middleware/authMiddleware'
import PracticeSession from '../models/PracticeSession'

const router = express.Router()

// Create new practice session
router.post('/sessions', protect, async (req, res) => {
    try {
        const session = new PracticeSession({
            userId: req.user!._id,
            configuration: req.body.configuration
        })
        await session.save()
        res.status(201).json(session)
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
})

// Get session by ID
router.get('/sessions/:id', protect, async (req, res) => {
    try {
        const session = await PracticeSession.findOne({
            _id: req.params.id,
            userId: req.user!._id
        })
        if (!session) return res.status(404).json({ error: 'Session not found' })
        res.json(session)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// Update session
router.put('/sessions/:id', protect, async (req, res) => {
    try {
        const session = await PracticeSession.findOneAndUpdate(
            { _id: req.params.id, userId: req.user!._id },
            req.body,
            { new: true, runValidators: true }
        )
        if (!session) return res.status(404).json({ error: 'Session not found' })
        res.json(session)
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
})

// Delete session
router.delete('/sessions/:id', protect, async (req, res) => {
    try {
        const session = await PracticeSession.findOneAndDelete({
            _id: req.params.id,
            userId: req.user!._id
        })
        if (!session) return res.status(404).json({ error: 'Session not found' })
        res.json({ message: 'Session deleted' })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// Get user's sessions
router.get('/sessions/user/:userId', protect, async (req, res) => {
    try {
        const sessions = await PracticeSession.find({ userId: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(50)
        res.json(sessions)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// Save practice results
router.post('/results', protect, async (req, res) => {
    try {
        const { sessionId, metrics, overallScore, strengths, weaknesses, recommendations, badges } = req.body
        const session = await PracticeSession.findOneAndUpdate(
            { _id: sessionId, userId: req.user!._id },
            {
                metrics,
                overallScore,
                strengths,
                weaknesses,
                recommendations,
                badges,
                status: 'completed',
                completedAt: new Date()
            },
            { new: true }
        )
        if (!session) return res.status(404).json({ error: 'Session not found' })
        res.json(session)
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
})

// Save practice profile (for /dashboard/code onboarding)
router.post('/profile', async (req, res) => {
    try {
        const { userId, name, course, department, level } = req.body
        if (!userId) return res.status(400).json({ error: 'userId required' })
        // Store in a simple key-value cache (could be its own model; using localStorage on client as primary store)
        res.json({ ok: true, profile: { userId, name, course, department, level } })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

export default router
