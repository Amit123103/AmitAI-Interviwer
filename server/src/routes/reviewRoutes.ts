import express from 'express';
import { submitPeerReview, addMentorComment } from '../controllers/reviewController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/peer', protect, submitPeerReview);
router.post('/mentor', protect, addMentorComment);

export default router;
