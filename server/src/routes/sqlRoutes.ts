import express from 'express'
import { protect, adminOnly } from '../middleware/authMiddleware'
import {
    executeRawSQL,
    getDatabaseStats,
    getTableData
} from '../controllers/sqlController'

const router = express.Router()

// All database management routes are strictly Admin Only
router.use(protect, adminOnly)

router.get('/stats', getDatabaseStats)
router.get('/table/:tableName', getTableData)
router.post('/execute', executeRawSQL)

export default router
