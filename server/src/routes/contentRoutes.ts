import express from 'express'
import { protect } from '../middleware/authMiddleware'
import {
    getAnnouncements,
    getResources,
    getActivityTimeline
} from '../controllers/userController'

const router = express.Router()

router.get('/announcements', protect, getAnnouncements)
router.get('/resources', protect, getResources)
router.get('/activity', protect, getActivityTimeline)

export default router
