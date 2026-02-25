/// <reference path="../types/express.d.ts" />
import express from 'express'
import { protect } from '../middleware/authMiddleware'
import Question from '../models/Question'
import UserQuestionProgress from '../models/UserQuestionProgress'
import CustomQuestionList from '../models/CustomQuestionList'

const router = express.Router()

// Get all questions with filters
router.get('/', protect, async (req, res) => {
    try {
        const { role, difficulty, type, search, page = '1', limit = '20' } = req.query

        const query: any = {}
        if (role) query.role = role
        if (difficulty) query.difficulty = difficulty
        if (type) query.type = type
        if (search) query.$text = { $search: search as string }

        const pageNum = parseInt(page as string)
        const limitNum = parseInt(limit as string)

        const questions = await Question.find(query)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .sort({ createdAt: -1 })

        const total = await Question.countDocuments(query)

        res.json({
            questions,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// Get question by ID
router.get('/:id', protect, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate('relatedQuestions', 'title type difficulty')
        if (!question) return res.status(404).json({ error: 'Question not found' })

        // Get user progress for this question
        const progress = await UserQuestionProgress.findOne({
            userId: req.user!._id,
            questionId: req.params.id
        })

        res.json({ question, progress })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// Record practice
router.post('/practice', protect, async (req, res) => {
    try {
        const { questionId, score, duration, feedback } = req.body

        let progress = await UserQuestionProgress.findOne({
            userId: req.user!._id,
            questionId
        })

        if (!progress) {
            progress = new UserQuestionProgress({
                userId: req.user!._id,
                questionId,
                practiced: true,
                attempts: 1,
                averageScore: score,
                bestScore: score,
                lastPracticed: new Date(),
                practiceHistory: [{ date: new Date(), score, duration, feedback }]
            })
        } else {
            progress.practiced = true
            progress.attempts += 1
            progress.lastPracticed = new Date()
            progress.averageScore = (progress.averageScore! * (progress.attempts - 1) + score) / progress.attempts
            progress.bestScore = Math.max(progress.bestScore || 0, score)
            progress.practiceHistory.push({ date: new Date(), score, duration, feedback })

            // Mark as mastered if score > 85 for 3+ attempts
            if (progress.attempts >= 3 && progress.averageScore >= 85) {
                progress.mastered = true
            }
        }

        await progress.save()
        res.json(progress)
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
})

// Get user progress
router.get('/user/progress', protect, async (req, res) => {
    try {
        const progress = await UserQuestionProgress.find({ userId: req.user!._id })
            .populate('questionId', 'title type difficulty')
        res.json(progress)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// Toggle bookmark
router.post('/bookmark', protect, async (req, res) => {
    try {
        const { questionId } = req.body

        let progress = await UserQuestionProgress.findOne({
            userId: req.user!._id,
            questionId
        })

        if (!progress) {
            progress = new UserQuestionProgress({
                userId: req.user!._id,
                questionId,
                bookmarked: true
            })
        } else {
            progress.bookmarked = !progress.bookmarked
        }

        await progress.save()
        res.json(progress)
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
})

// Get user's custom lists
router.get('/lists', protect, async (req, res) => {
    try {
        const lists = await CustomQuestionList.find({ userId: req.user!._id })
            .populate('questions', 'title type difficulty')
            .sort({ createdAt: -1 })
        res.json(lists)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// Create custom list
router.post('/lists', protect, async (req, res) => {
    try {
        const list = new CustomQuestionList({
            userId: req.user!._id,
            name: req.body.name,
            description: req.body.description,
            questions: req.body.questions || []
        })
        await list.save()
        res.status(201).json(list)
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
})

// Update custom list
router.put('/lists/:id', protect, async (req, res) => {
    try {
        const list = await CustomQuestionList.findOneAndUpdate(
            { _id: req.params.id, userId: req.user!._id },
            req.body,
            { new: true }
        ).populate('questions', 'title type difficulty')

        if (!list) return res.status(404).json({ error: 'List not found' })
        res.json(list)
    } catch (error: any) {
        res.status(400).json({ error: error.message })
    }
})

// Delete custom list
router.delete('/lists/:id', protect, async (req, res) => {
    try {
        const list = await CustomQuestionList.findOneAndDelete({
            _id: req.params.id,
            userId: req.user!._id
        })
        if (!list) return res.status(404).json({ error: 'List not found' })
        res.json({ message: 'List deleted' })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

export default router

