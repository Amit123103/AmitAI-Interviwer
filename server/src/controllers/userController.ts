import { Request, Response } from 'express'
import Announcement from '../models/Announcement'
import Resource from '../models/Resource'
import Report from '../models/Report'
import Submission from '../models/Submission'
import ProPayment from '../models/ProPayment'
import InterviewSession from '../models/InterviewSession'

export const getAnnouncements = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user
        const query: any = {
            expiresAt: { $gte: new Date() }
        }

        if (user.subscriptionStatus === 'pro') {
            query.audience = { $in: ['all', 'pro'] }
        } else {
            query.audience = { $in: ['all', 'students'] }
        }

        const announcements = await Announcement.find(query)
            .sort({ createdAt: -1 })
            .lean()
        res.json(announcements)
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export const getResources = async (req: Request, res: Response) => {
    try {
        const resources = await Resource.find().sort({ createdAt: -1 }).lean()
        res.json(resources)
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export const getActivityTimeline = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id

        // Fetch different types of activity
        const [interviews, submissions, payments] = await Promise.all([
            Report.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
            Submission.find({ userId }).populate('problemId').sort({ createdAt: -1 }).limit(5).lean(),
            ProPayment.find({ userId, status: 'approved' }).sort({ createdAt: -1 }).limit(3).lean()
        ])

        const timeline: any[] = []

        interviews.forEach((int: any) => {
            timeline.push({
                id: int._id,
                type: 'interview',
                title: `Interview: ${int.sector}`,
                subtitle: `Scored ${Math.round((int.scores.technical + int.scores.communication + int.scores.confidence) / 3)}%`,
                timestamp: int.createdAt,
                status: 'success'
            })
        })

        submissions.forEach((sub: any) => {
            timeline.push({
                id: sub._id,
                type: 'coding',
                title: sub.problemId?.title || 'Coding Challenge',
                subtitle: `Result: ${sub.status}`,
                timestamp: sub.createdAt,
                status: sub.status === 'Accepted' ? 'success' : 'failed'
            })
        })

        payments.forEach((pay: any) => {
            timeline.push({
                id: pay._id,
                type: 'payment',
                title: 'Pro Upgrade',
                subtitle: `${pay.selectedPlan} plan authorized`,
                timestamp: pay.createdAt,
                status: 'success'
            })
        })

        // Sort by timestamp
        timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        res.json(timeline.slice(0, 10))
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}
