import { Request, Response } from 'express';
import User from '../models/User';
import Report from '../models/Report';
import Post from '../models/Post';
import ProPayment from '../models/ProPayment';
import Config from '../models/Config';
import AdminLog from '../models/AdminLog';
import Announcement from '../models/Announcement';
import Resource from '../models/Resource';
import UpgradeRequest from '../models/UpgradeRequest';
import bcrypt from 'bcryptjs';
import { Parser } from 'json2csv';

// Helper for Admin Logging
const logAdminAction = async (req: Request, action: string, targetId: any, targetName: string, details: any) => {
    try {
        const admin = (req as any).user;
        await AdminLog.create({
            adminId: admin._id,
            adminName: admin.username,
            action,
            targetId,
            targetName,
            details,
            ipAddress: req.ip || 'unknown'
        });

        // Also broadcast as a live event
        if ((global as any).broadcastAdminEvent) {
            (global as any).broadcastAdminEvent('admin:intervention', {
                adminName: admin.username,
                action,
                targetName,
                timestamp: Date.now()
            });
        }
    } catch (err) {
        console.error('[AdminLog] Failed to log action:', err);
    }
};

export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await User.countDocuments();
        const proUsers = await User.countDocuments({ 'proSubscription.isActive': true });
        const totalInterviews = await Report.countDocuments();
        const totalPosts = await Post.countDocuments();

        // Calculate REAL Revenue from approved payments
        const revenueResult = await ProPayment.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // Get daily active users (proxied by updated users in last 24h)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const activeUsers = await User.countDocuments({ updatedAt: { $gte: oneDayAgo } });

        res.json({
            totalUsers,
            proUsers,
            totalInterviews,
            totalPosts,
            totalRevenue,
            activeUsers
        });
    } catch (error: any) {
        console.error("Admin Stats Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const { search, status, role, page = 1, limit = 20 } = req.query;
        const query: any = {};

        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ];
            // If search looks like an ObjectId
            if (/^[0-9a-fA-F]{24}$/.test(search as string)) {
                query.$or.push({ _id: search });
            }
        }

        if (status) {
            if (status === 'pro') query['proSubscription.isActive'] = true;
            if (status === 'free') query['proSubscription.isActive'] = { $ne: true };
            if (status === 'suspended') query.accountStatus = 'suspended';
        }

        if (role) query.role = role;

        const skip = (Number(page) - 1) * Number(limit);
        const [users, total] = await Promise.all([
            User.find(query)
                .select('-passwordHash')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            User.countDocuments(query)
        ]);

        res.json({
            users,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit))
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUserStatus = async (req: Request, res: Response) => {
    try {
        const { userId, status } = req.body;
        if (!['active', 'suspended'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.accountStatus = status;
        await user.save();

        await logAdminAction(req, 'UPDATE_STATUS', user._id, user.username, { newStatus: status });

        res.json(user.toObject({ getters: true, virtuals: false, transform: (doc, ret: any) => { delete ret.passwordHash; return ret; } }));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const manualProToggle = async (req: Request, res: Response) => {
    try {
        const { userId, isActive, plan, durationDays } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isCurrentlyPro = user.proSubscription?.isActive;

        if (isActive) {
            const start = new Date();
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + (durationDays || 30));
            user.proSubscription = {
                isActive: true,
                startDate: start,
                expiryDate: expiry,
                plan: plan || 'monthly',
                paymentId: null
            };
            user.subscriptionStatus = 'pro';
            user.currentPeriodEnd = expiry;
        } else {
            user.proSubscription = {
                isActive: false,
                startDate: null,
                expiryDate: null,
                plan: null,
                paymentId: null
            };
            user.subscriptionStatus = 'free';
            user.currentPeriodEnd = undefined;
        }

        await user.save();

        await logAdminAction(req, 'MANUAL_PRO_TOGGLE', user._id, user.username, { isPro: isActive });

        res.json(user.toObject({ getters: true, virtuals: false, transform: (doc, ret: any) => { delete ret.passwordHash; return ret; } }));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const exportData = async (req: Request, res: Response) => {
    try {
        const { type } = req.params; // 'users' or 'payments'

        if (type === 'users') {
            const users = await User.find({}).select('username email role accountStatus subscriptionStatus createdAt').lean();
            const fields = ['username', 'email', 'role', 'accountStatus', 'subscriptionStatus', 'createdAt'];
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(users);
            res.header('Content-Type', 'text/csv');
            res.attachment('users_export.csv');
            return res.send(csv);
        }

        if (type === 'payments') {
            const payments = await ProPayment.find({}).populate('userId', 'email').lean();
            const data = payments.map((p: any) => ({
                email: p.userId?.email,
                plan: p.selectedPlan,
                amount: p.amount,
                txnId: p.transactionId,
                status: p.status,
                date: p.createdAt
            }));
            const fields = ['email', 'plan', 'amount', 'txnId', 'status', 'date'];
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(data);
            res.header('Content-Type', 'text/csv');
            res.attachment('payments_export.csv');
            return res.send(csv);
        }

        res.status(400).json({ message: 'Invalid export type' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { userId, role } = req.body;
        if (!['student', 'admin', 'sub-admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        await logAdminAction(req, 'UPDATE_USER_ROLE', user._id, user.username, { newRole: role });

        res.json(user.toObject({ getters: true, virtuals: false, transform: (doc, ret: any) => { delete ret.passwordHash; return ret; } }));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUserDetailed = async (req: Request, res: Response) => {
    try {
        const { userId, xp, level, streak, stats, ...rest } = req.body; // Capture other fields if any

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const update: any = {};
        if (xp !== undefined) update.xp = xp;
        if (level !== undefined) update.level = level;
        if (streak !== undefined) update.streak = streak;
        if (stats) {
            if (stats.totalInterviews !== undefined) update['stats.totalInterviews'] = stats.totalInterviews;
            if (stats.totalCodeLines !== undefined) update['stats.totalCodeLines'] = stats.totalCodeLines;
            if (stats.averageScore !== undefined) update['stats.averageScore'] = stats.averageScore;
        }

        // Apply updates
        Object.assign(user, update);
        // Apply any other fields passed in 'rest'
        Object.assign(user, rest);

        await user.save();

        await logAdminAction(req, 'UPDATE_USER_DETAILED', user._id, user.username, { ...update, ...rest });

        res.json(user.toObject({ getters: true, virtuals: false, transform: (doc, ret: any) => { delete ret.passwordHash; return ret; } }));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// User Analytics Functions
export const getUserTrends = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        // Get user's reports over time
        const reports = await Report.find({ userId })
            .sort({ createdAt: 1 })
            .select('createdAt scores sector');

        // Format data for trends
        const trends = reports.map(report => ({
            date: report.createdAt,
            technical: report.scores?.technical || 0,
            communication: report.scores?.communication || 0,
            confidence: report.scores?.confidence || 0,
            sector: report.sector
        }));

        res.json({ trends });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getSkillProficiency = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        // Get user's latest reports grouped by sector
        const reports = await Report.find({ userId })
            .sort({ createdAt: -1 })
            .select('scores sector');

        // Calculate average scores by sector
        const skillMap: any = {};
        reports.forEach(report => {
            const sector = report.sector || 'General';
            if (!skillMap[sector]) {
                skillMap[sector] = { total: 0, count: 0 };
            }
            const avgScore = ((report.scores?.technical || 0) +
                (report.scores?.communication || 0) +
                (report.scores?.confidence || 0)) / 3;
            skillMap[sector].total += avgScore;
            skillMap[sector].count += 1;
        });

        const skills = Object.entries(skillMap).map(([sector, data]: [string, any]) => ({
            sector,
            proficiency: Math.round(data.total / data.count)
        }));

        res.json({ skills });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getIndustryBenchmarks = async (req: Request, res: Response) => {
    try {
        const { sector } = req.query;

        // Aggregate reports to calculate averages by sector
        const matchStage = sector ? { sector } : {};

        const benchmarks = await Report.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$sector",
                    avgTechnical: { $avg: "$scores.technical" },
                    avgCommunication: { $avg: "$scores.communication" },
                    avgConfidence: { $avg: "$scores.confidence" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { avgTechnical: -1 } }
        ]);

        if (benchmarks.length === 0) {
            return res.json({
                benchmarks: [{
                    _id: 'Global',
                    avgTechnical: 70,
                    avgCommunication: 75,
                    avgConfidence: 72
                }]
            });
        }

        res.json({ benchmarks });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getComparison = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { reportIds } = req.query;

        if (!reportIds || typeof reportIds !== 'string') {
            return res.status(400).json({ message: 'Report IDs required' });
        }

        const ids = reportIds.split(',');
        const reports = await Report.find({
            _id: { $in: ids },
            userId
        }).select('sector scores createdAt');

        const comparison = reports.map(report => ({
            id: report._id,
            sector: report.sector,
            date: report.createdAt,
            scores: report.scores
        }));

        res.json({ comparison });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserDetails = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const [user, logins, payments] = await Promise.all([
            User.findById(userId).select('-passwordHash').lean(),
            require('../models/LoginLog').default.find({ userId }).sort({ timestamp: -1 }).limit(10).lean(),
            ProPayment.find({ userId }).sort({ createdAt: -1 }).lean()
        ]);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user,
            logins,
            payments
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// --- PHASE 5: ADVANCED STUDENT & PLATFORM MANAGEMENT ---

export const createUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password, role, accountStatus } = req.body;

        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) return res.status(400).json({ message: 'User or Email already exists' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            email,
            passwordHash,
            role: role || 'student',
            accountStatus: accountStatus || 'active'
        });

        await logAdminAction(req, 'CREATE_USER', newUser._id, newUser.username, { role: newUser.role });

        res.status(201).json({ message: 'User created successfully', user: { id: newUser._id, email: newUser.email } });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const username = user.username;
        await User.findByIdAndDelete(userId);

        await logAdminAction(req, 'DELETE_USER', userId, username, { permanent: true });

        res.json({ message: 'User permanently removed from platform' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Announcement Flow
export const createAnnouncement = async (req: Request, res: Response) => {
    try {
        const { title, content, priority, audience, expiresAt } = req.body;
        const announcement = await Announcement.create({
            title,
            content,
            priority,
            audience,
            expiresAt,
            createdBy: (req as any).user._id
        });

        await logAdminAction(req, 'CREATE_ANNOUNCEMENT', announcement._id, title, { priority, audience });

        // Broadcast to all
        if ((global as any).broadcastAdminEvent) {
            (global as any).broadcastAdminEvent('platform:announcement', announcement);
        }

        res.status(201).json(announcement);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAnnouncements = async (req: Request, res: Response) => {
    try {
        const announcements = await Announcement.find()
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();
        res.json(announcements);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await Announcement.findByIdAndDelete(id);
        res.json({ message: 'Announcement removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Resource Flow
export const createResource = async (req: Request, res: Response) => {
    try {
        const { title, description, url, type, category, isProOnly } = req.body;
        const resource = await Resource.create({
            title,
            description,
            url,
            type,
            category,
            isProOnly,
            createdBy: (req as any).user._id
        });

        await logAdminAction(req, 'CREATE_RESOURCE', resource._id, title, { type, isProOnly });

        // Live update for students
        if ((global as any).broadcastAdminEvent) {
            (global as any).broadcastAdminEvent('platform:resource_new', resource);
        }

        res.status(201).json(resource);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getResources = async (req: Request, res: Response) => {
    try {
        const resources = await Resource.find().sort({ createdAt: -1 }).lean();
        res.json(resources);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Upgrade Request Flow
export const getUpgradeRequests = async (req: Request, res: Response) => {
    try {
        const requests = await UpgradeRequest.find({ status: 'pending' })
            .populate('userId', 'username email')
            .sort({ createdAt: -1 })
            .lean();
        res.json(requests);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const respondToUpgradeRequest = async (req: Request, res: Response) => {
    try {
        const { requestId, status, adminNote } = req.body;
        const request = await UpgradeRequest.findById(requestId).populate('userId');
        if (!request) return res.status(404).json({ message: 'Request not found' });

        request.status = status;
        request.adminNote = adminNote;
        await request.save();

        if (status === 'approved') {
            const user = await User.findById(request.userId._id);
            if (user) {
                const expiryValue = request.requestedPlan === 'yearly' ? 365 : (request.requestedPlan === '6month' ? 180 : 30);
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + expiryValue);

                user.subscriptionStatus = 'pro';
                user.proSubscription = {
                    isActive: true,
                    plan: request.requestedPlan,
                    startDate: new Date(),
                    expiryDate: expiry,
                    paymentId: null
                };
                user.currentPeriodEnd = expiry;
                await user.save();

                await logAdminAction(req, 'APPROVE_UPGRADE', user._id, user.username, { plan: request.requestedPlan });
            }
        } else {
            await logAdminAction(req, 'REJECT_UPGRADE', request.userId._id, (request.userId as any).username, { reason: adminNote });
        }

        res.json({ message: `Request ${status} successfully` });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getSystemConfig = async (req: Request, res: Response) => {
    try {
        const config = await Config.find().lean();
        res.json(config);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSystemConfig = async (req: Request, res: Response) => {
    try {
        const { key, value } = req.body;
        const config = await Config.findOneAndUpdate(
            { key },
            { value, updatedBy: (req as any).user?._id },
            { upsert: true, new: true }
        );

        await logAdminAction(req, 'UPDATE_SYSTEM_CONFIG', key, key, { value });

        // Broadcast config change
        if ((global as any).broadcastAdminEvent) {
            (global as any).broadcastAdminEvent('system:config_update', { key, value });
        }

        res.json(config);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getPredictiveStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await User.countDocuments();
        const proUsers = await User.countDocuments({ 'proSubscription.isActive': true });

        // Conversion Logic
        const conversionRate = totalUsers > 0 ? (proUsers / totalUsers) * 100 : 0;

        // Revenue Forecasting (Simple 30-day projection based on current active pros)
        // Assuming average plan is 399
        const monthlyForecast = proUsers * 399;

        res.json({
            conversionRate: conversionRate.toFixed(2),
            monthlyForecast,
            activeProGrowth: "+15%", // Mocked for UI demonstration
            forecastConfidence: 94
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getSystemHealth = async (req: Request, res: Response) => {
    try {
        const { ServiceStatus } = require('../services/healthMonitor');
        const mongoose = require('mongoose');

        res.json({
            database: mongoose.connection.readyState === 1 ? 'healthy' : 'disconnected',
            aiService: ServiceStatus.ai ? 'healthy' : 'offline',
            ollama: ServiceStatus.ollama ? 'healthy' : 'offline',
            latency: Math.floor(Math.random() * 200) + 50, // Mock latency
            uptime: Math.floor(process.uptime())
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAdminLogs = async (req: Request, res: Response) => {
    try {
        const logs = await AdminLog.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
