import { Router, Request, Response } from 'express';
import { AdvancedNote } from '../models/AdvancedNote';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// GET all notes for a user (list view)
router.get('/user/:userId', protect, async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const authReq = req as any;

        if (authReq.user?.id !== userId) {
            res.status(403).json({ success: false, error: 'Not authorized' });
            return;
        }

        const notes = await AdvancedNote.find({ userId })
            .select('title previewText createdAt updatedAt')
            .sort({ updatedAt: -1 });

        res.status(200).json({ success: true, count: notes.length, data: notes });
    } catch (error: any) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// GET single note by ID
router.get('/:id', protect, async (req: Request, res: Response): Promise<void> => {
    try {
        const note = await AdvancedNote.findById(req.params.id);

        if (!note) {
            res.status(404).json({ success: false, error: 'Note not found' });
            return;
        }

        const authReq = req as any;
        if (note.userId.toString() !== authReq.user?.id) {
            res.status(403).json({ success: false, error: 'Not authorized' });
            return;
        }

        res.status(200).json({ success: true, data: note });
    } catch (error: any) {
        console.error('Error fetching note details:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// POST create a new note
router.post('/', protect, async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as any;
        const userId = authReq.user?.id;
        const { title, pages } = req.body;

        const note = await AdvancedNote.create({
            userId,
            title: title || 'Untitled Note',
            pages: pages || []
        });

        res.status(201).json({ success: true, data: note });
    } catch (error: any) {
        console.error('Error creating note:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// PUT update note (autosave)
router.put('/:id', protect, async (req: Request, res: Response): Promise<void> => {
    try {
        let note = await AdvancedNote.findById(req.params.id);

        if (!note) {
            res.status(404).json({ success: false, error: 'Note not found' });
            return;
        }

        const authReq = req as any;
        if (note.userId.toString() !== authReq.user?.id) {
            res.status(403).json({ success: false, error: 'Not authorized' });
            return;
        }

        note = await AdvancedNote.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: note });
    } catch (error: any) {
        console.error('Error updating note:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// DELETE a note
router.delete('/:id', protect, async (req: Request, res: Response): Promise<void> => {
    try {
        const note = await AdvancedNote.findById(req.params.id);

        if (!note) {
            res.status(404).json({ success: false, error: 'Note not found' });
            return;
        }

        const authReq = req as any;
        if (note.userId.toString() !== authReq.user?.id) {
            res.status(403).json({ success: false, error: 'Not authorized' });
            return;
        }

        await note.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error: any) {
        console.error('Error deleting note:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

export default router;
