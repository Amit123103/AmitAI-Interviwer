import { Request, Response } from 'express';
import ProPayment from '../models/ProPayment';
import User from '../models/User';
import path from 'path';
import fs from 'fs';

// Plan duration mapping (in days)
const PLAN_DURATIONS: Record<string, number> = {
    monthly: 30,
    '6month': 180,
    yearly: 365,
};

const PLAN_AMOUNTS: Record<string, number> = {
    monthly: 150,
    '6month': 850,
    yearly: 1700,
};

// ── Submit a payment proof ──────────────────────────────────────────
export const submitPayment = async (req: any, res: Response) => {
    try {
        const { transactionId, selectedPlan, paymentDate, email } = req.body;
        const userId = req.user._id;

        // Validate required fields
        if (!transactionId || !selectedPlan || !paymentDate || !email) {
            return res.status(400).json({ message: 'All fields are required: transactionId, selectedPlan, paymentDate, email' });
        }

        // Validate plan
        if (!PLAN_DURATIONS[selectedPlan]) {
            return res.status(400).json({ message: 'Invalid plan. Choose monthly, 6month, or yearly.' });
        }

        // Check unique transaction ID
        const existingPayment = await ProPayment.findOne({ transactionId: transactionId.trim() });
        if (existingPayment) {
            return res.status(409).json({ message: 'This Transaction ID has already been submitted. Please use a unique transaction ID.' });
        }

        // Validate screenshot was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'Payment screenshot is required.' });
        }

        // Validate file size (5MB max) — also handled by multer but double-check
        if (req.file.size > 5 * 1024 * 1024) {
            // Delete the uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Screenshot file size must be under 5MB.' });
        }

        // Check for pending payment from same user
        const pendingPayment = await ProPayment.findOne({ userId, status: 'pending' });
        if (pendingPayment) {
            // Delete newly uploaded file
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(409).json({ message: 'You already have a pending payment. Please wait for it to be reviewed.' });
        }

        const payment = new ProPayment({
            userId,
            email: email.trim().toLowerCase(),
            selectedPlan,
            amount: PLAN_AMOUNTS[selectedPlan],
            transactionId: transactionId.trim(),
            screenshotPath: req.file.path.replace(/\\/g, '/'), // normalize path
            paymentDate: new Date(paymentDate),
            status: 'pending',
        });

        await payment.save();

        console.log(`[PRO] Payment submitted by user ${userId} — Plan: ${selectedPlan}, TxnID: ${transactionId}`);

        res.status(201).json({
            message: 'Payment submitted successfully! Your payment is under verification. Pro access will be activated after admin approval.',
            paymentId: payment._id,
            status: 'pending',
        });
    } catch (error: any) {
        console.error('[PRO] Submit payment error:', error);
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Duplicate transaction ID. Please use a unique transaction ID.' });
        }
        res.status(500).json({ message: 'Failed to submit payment. Please try again.' });
    }
};

// ── Get current user's payment history ──────────────────────────────
export const getMyPayments = async (req: any, res: Response) => {
    try {
        const payments = await ProPayment.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .lean();

        res.json({ payments });
    } catch (error: any) {
        console.error('[PRO] Get my payments error:', error);
        res.status(500).json({ message: 'Failed to fetch payment history.' });
    }
};

// ── Get current user's Pro status ───────────────────────────────────
export const getProStatus = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user._id).select('proSubscription subscriptionStatus').lean();
        if (!user) return res.status(404).json({ message: 'User not found' });

        const proSub = (user as any).proSubscription;
        const isActive = proSub?.isActive && proSub?.expiryDate && new Date(proSub.expiryDate) > new Date();

        res.json({
            isPro: isActive || false,
            plan: proSub?.plan || null,
            expiryDate: proSub?.expiryDate || null,
            startDate: proSub?.startDate || null,
        });
    } catch (error: any) {
        console.error('[PRO] Get pro status error:', error);
        res.status(500).json({ message: 'Failed to fetch Pro status.' });
    }
};

// ══════════════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS
// ══════════════════════════════════════════════════════════════════════

// ── Get all payment submissions (admin) ─────────────────────────────
export const getAllPayments = async (req: any, res: Response) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter: any = {};
        if (status && ['pending', 'approved', 'rejected'].includes(status as string)) {
            filter.status = status;
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [payments, total] = await Promise.all([
            ProPayment.find(filter)
                .populate('userId', 'username email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            ProPayment.countDocuments(filter),
        ]);

        res.json({
            payments,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
        });
    } catch (error: any) {
        console.error('[PRO] Get all payments error:', error);
        res.status(500).json({ message: 'Failed to fetch payments.' });
    }
};

// ── Approve a payment (admin) ───────────────────────────────────────
export const approvePayment = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { adminNote } = req.body;

        const payment = await ProPayment.findById(id);
        if (!payment) return res.status(404).json({ message: 'Payment not found.' });
        if (payment.status === 'approved') return res.status(400).json({ message: 'Payment already approved.' });

        // Calculate subscription dates
        const startDate = new Date();
        const durationDays = PLAN_DURATIONS[payment.selectedPlan] || 30;
        const expiryDate = new Date(startDate);
        expiryDate.setDate(expiryDate.getDate() + durationDays);

        // Update payment record
        payment.status = 'approved';
        payment.reviewedAt = new Date();
        payment.reviewedBy = req.user._id;
        if (adminNote) payment.adminNote = adminNote;
        await payment.save();

        // Update user's Pro subscription
        await User.findByIdAndUpdate(payment.userId, {
            subscriptionStatus: 'pro',
            proSubscription: {
                isActive: true,
                plan: payment.selectedPlan,
                startDate,
                expiryDate,
                paymentId: payment._id,
            },
            currentPeriodEnd: expiryDate,
        });

        console.log(`[PRO] ✅ Payment ${id} APPROVED by admin ${req.user._id} — User ${payment.userId} gets Pro until ${expiryDate.toISOString()}`);

        // Try to send approval email (don't fail if email fails)
        try {
            const { sendProApprovedEmail } = require('../services/emailService');
            await sendProApprovedEmail(payment.email, payment.selectedPlan, expiryDate);
        } catch (emailErr) {
            console.warn('[PRO] Failed to send approval email:', emailErr);
        }

        res.json({
            message: 'Payment approved! User has been granted Pro access.',
            expiryDate,
            plan: payment.selectedPlan,
        });
    } catch (error: any) {
        console.error('[PRO] Approve payment error:', error);
        res.status(500).json({ message: 'Failed to approve payment.' });
    }
};

// ── Reject a payment (admin) ────────────────────────────────────────
export const rejectPayment = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { adminNote } = req.body;

        const payment = await ProPayment.findById(id);
        if (!payment) return res.status(404).json({ message: 'Payment not found.' });
        if (payment.status === 'approved') return res.status(400).json({ message: 'Cannot reject an approved payment.' });

        payment.status = 'rejected';
        payment.reviewedAt = new Date();
        payment.reviewedBy = req.user._id;
        if (adminNote) payment.adminNote = adminNote;
        await payment.save();

        console.log(`[PRO] ❌ Payment ${id} REJECTED by admin ${req.user._id}`);

        // Try to send rejection email
        try {
            const { sendProRejectedEmail } = require('../services/emailService');
            await sendProRejectedEmail(payment.email, adminNote || 'Payment could not be verified.');
        } catch (emailErr) {
            console.warn('[PRO] Failed to send rejection email:', emailErr);
        }

        res.json({ message: 'Payment rejected.', paymentId: id });
    } catch (error: any) {
        console.error('[PRO] Reject payment error:', error);
        res.status(500).json({ message: 'Failed to reject payment.' });
    }
};
