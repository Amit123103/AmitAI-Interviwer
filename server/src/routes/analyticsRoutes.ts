import express from 'express';
import { getUserTrends, getSkillProficiency, getIndustryBenchmarks, getComparison } from '../controllers/analyticsController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/trends', protect, getUserTrends);
router.get('/skills', protect, getSkillProficiency);
router.get('/benchmarks', getIndustryBenchmarks);
router.get('/compare', protect, getComparison);

export default router;
