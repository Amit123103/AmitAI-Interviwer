import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { startNegotiation, submitOffer } from '../controllers/negotiationController';

const router = express.Router();

router.post('/start', protect, startNegotiation);
router.post('/offer', protect, submitOffer);

export default router;
