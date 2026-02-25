/// <reference path="../types/express-augment.d.ts" />
import express from 'express'
import { protect } from '../middleware/authMiddleware'
import Company from '../models/Company'
import MockInterviewResult from '../models/MockInterviewResult'

const router = express.Router()

// Get all companies
router.get('/', protect, async (req, res) => {
    try {
        const { category, search } = req.query

        const query: any = { isActive: true }
        if (category && category !== 'All') query.category = category
        if (search) query.$text = { $search: search as string }

        const companies = await Company.find(query).sort({ name: 1 })
        res.json(companies)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// Get company by slug
router.get('/:slug', protect, async (req, res) => {
    try {
        const company = await Company.findOne({ slug: req.params.slug })
        if (!company) return res.status(404).json({ error: 'Company not found' })
        res.json(company)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// Start mock interview
router.post('/mock', protect, async (req, res) => {
    try {
        const { companyId } = req.body

        const mockInterview = new MockInterviewResult({
            userId: req.user!._id,
            companyId,
            rounds: []
        })

        await mockInterview.save()
        res.status(201).json(mockInterview)
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
})

// Update mock interview
router.put('/mock/:id', protect, async (req, res) => {
    try {
        const mockInterview = await MockInterviewResult.findOneAndUpdate(
            { _id: req.params.id, userId: req.user!._id },
            req.body,
            { new: true }
        )
        if (!mockInterview) return res.status(404).json({ error: 'Mock interview not found' })
        res.json(mockInterview)
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
})

// Get user's mock results
router.get('/mock/results', protect, async (req, res) => {
    try {
        const results = await MockInterviewResult.find({ userId: req.user!._id })
            .populate('companyId', 'name logo category')
            .sort({ completedAt: -1 })
            .limit(50)
        res.json(results)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

export default router

