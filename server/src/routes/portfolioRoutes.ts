import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
    getPortfolio,
    savePortfolio,
    getPublicPortfolio,
    publishPortfolio,
    unpublishPortfolio,
    importFromLinkedIn,
    checkSlug,
    getGithubRepos,
    sendMessage
} from '../controllers/portfolioController';

const router = express.Router();

// Private routes (requires authentication)
router.get('/', protect, getPortfolio);
router.post('/save', protect, savePortfolio);
router.post('/publish', protect, publishPortfolio);
router.post('/unpublish', protect, unpublishPortfolio);
router.post('/import/linkedin', protect, importFromLinkedIn);
router.get('/check-slug/:slug', protect, checkSlug);
router.get('/github/:username', protect, getGithubRepos);

// Public route
router.get('/public/:id', getPublicPortfolio);
router.post('/message/:id', sendMessage);

export default router;
