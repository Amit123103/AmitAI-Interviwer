import { Request, Response } from 'express';
import axios from 'axios';
import Report from '../models/Report';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const startNegotiation = async (req: any, res: Response) => {
    try {
        const { reportId, targetSalary } = req.body;
        const report = await Report.findById(reportId) as any;
        if (!report) return res.status(404).json({ message: 'Report not found' });

        const initialOffer = {
            base: Math.round(targetSalary * 0.85),
            bonus: 5000,
            equity: 10000
        };

        const initialMessage = "Hello! Based on your performance in the interviews, we're excited to offer you a position. Our initial compensation package is outlined below. We'd love to hear your thoughts.";

        // Link to report history if needed, but for now simple initiation
        report.negotiationLog = [{
            role: 'HR',
            message: initialMessage,
            offer: initialOffer,
            timestamp: new Date()
        }];
        await report.save();

        res.json({
            message: initialMessage,
            offer: initialOffer,
            log: report.negotiationLog
        });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};

export const submitOffer = async (req: any, res: Response) => {
    try {
        const { reportId, userMessage, targetSalary } = req.body;
        const report = await Report.findById(reportId) as any;
        if (!report) return res.status(404).json({ message: 'Report not found' });

        const currentLog = report.negotiationLog || [];
        const lastOffer = currentLog.length > 0 ? currentLog[currentLog.length - 1].offer : {};

        const aiRes = await axios.post(`${AI_SERVICE_URL}/negotiation/respond`, {
            user_id: report.user.toString(),
            report_id: reportId,
            current_offer: lastOffer,
            user_message: userMessage,
            history: currentLog.map((l: any) => ({ role: l.role, text: l.message })),
            target_salary: targetSalary,
            persona: "Head of Talent"
        });

        const { response_text, new_offer, is_final, audio } = aiRes.data;

        report.negotiationLog.push({
            role: 'Candidate',
            message: userMessage,
            timestamp: new Date()
        });
        report.negotiationLog.push({
            role: 'HR',
            message: response_text,
            offer: new_offer,
            timestamp: new Date()
        });

        await report.save();

        res.json({
            message: response_text,
            offer: new_offer,
            audio,
            isFinal: is_final,
            log: report.negotiationLog
        });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};
