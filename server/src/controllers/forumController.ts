import { Request, Response } from 'express';
import Post from '../models/Post';
import User from '../models/User';

// Get all posts (with pagination and filtering)
export const getPosts = async (req: Request, res: Response) => {
    try {
        const { category, sort, page = 1, limit = 10 } = req.query;
        const query: any = {};

        if (category && category !== 'All') {
            query.category = category;
        }

        const sortOption: any = {};
        if (sort === 'top') {
            sortOption.upvotes = -1; // roughly sort by upvotes length? Mongo simple sort by array length is tricky. 
            // For simplicity, let's sort by views or just createdAt for now, or use aggregation if needed.
            // Actually, let's just sort by createdAt desc for 'new' and 'views' for 'popular'
            sortOption.views = -1;
        } else {
            sortOption.createdAt = -1;
        }

        const posts = await Post.find(query)
            .sort(sortOption)
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await Post.countDocuments(query);

        res.json({ posts, total, totalPages: Math.ceil(total / Number(limit)) });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new post
export const createPost = async (req: any, res: Response) => {
    try {
        const { title, content, category, tags } = req.body;
        const user = await User.findById(req.user._id);

        const newPost = await Post.create({
            userId: req.user._id,
            username: user?.username || 'Anonymous',
            title,
            content,
            category,
            tags
        });

        // Award XP for posting?
        // await updateUserProgress(req.user._id, 10, {}); 

        res.status(201).json(newPost);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get single post
export const getPostById = async (req: Request, res: Response) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Increment view count
        post.views += 1;
        await post.save();

        res.json(post);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Add a comment
export const addComment = async (req: any, res: Response) => {
    try {
        const { content } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const user = await User.findById(req.user._id);

        post.comments.push({
            userId: req.user._id,
            username: user?.username || 'Anonymous',
            content,
            createdAt: new Date()
        });

        await post.save();
        res.json(post);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Toggle Vote
export const toggleVote = async (req: any, res: Response) => {
    try {
        const { type } = req.body; // 'upvote' or 'downvote'
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const userId = req.user._id;

        // Remove from both lists first to clean state
        post.upvotes = post.upvotes.filter(id => id.toString() !== userId.toString());
        post.downvotes = post.downvotes.filter(id => id.toString() !== userId.toString());

        if (type === 'upvote') {
            post.upvotes.push(userId);
        } else if (type === 'downvote') {
            post.downvotes.push(userId);
        }

        await post.save();
        res.json(post);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
