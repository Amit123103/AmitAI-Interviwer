import { Request, Response } from 'express';
import Report from '../models/Report';

export const submitPeerReview = async (req: Request, res: Response) => {
    try {
        const { reportId, score, comments } = req.body;
        const reviewerId = (req as any).user.id;

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        report.peerFeedback = {
            score,
            comments,
            reviewerId
        };

        await report.save();
        res.status(200).json({ message: 'Peer review submitted successfully', report });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const addMentorComment = async (req: Request, res: Response) => {
    try {
        const { reportId, text } = req.body;
        const mentorId = (req as any).user.id;

        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        report.mentorComments.push({
            text,
            mentorId,
            timestamp: new Date()
        });

        await report.save();
        res.status(200).json({ message: 'Mentor comment added successfully', report });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
