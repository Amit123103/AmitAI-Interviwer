import express from 'express';
import { getPosts, createPost, getPostById, addComment, toggleVote } from '../controllers/forumController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getPosts);
router.post('/', protect, createPost);
router.get('/:id', getPostById);
router.post('/:id/comment', protect, addComment);
router.post('/:id/vote', protect, toggleVote);

export default router;
