import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect, adminOnly } from '../middleware/authMiddleware';
import {
    submitPayment,
    getMyPayments,
    getProStatus,
    getAllPayments,
    approvePayment,
    rejectPayment,
} from '../controllers/proSubscriptionController';

const router = express.Router();

// ── Multer config for payment screenshots ───────────────────────────
const uploadsDir = path.join(process.cwd(), 'uploads', 'payment-screenshots');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
        const ext = path.extname(file.originalname);
        cb(null, `payment-${uniqueSuffix}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (_req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|gif/;
        const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = allowedTypes.test(file.mimetype);
        if (extName && mimeType) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed.'));
        }
    },
});

// ── Student routes ──────────────────────────────────────────────────
router.post('/submit', protect, upload.single('screenshot'), submitPayment);
router.get('/my-payments', protect, getMyPayments);
router.get('/status', protect, getProStatus);

// ── Admin routes ────────────────────────────────────────────────────
router.get('/admin/all', protect, adminOnly, getAllPayments);
router.put('/admin/approve/:id', protect, adminOnly, approvePayment);
router.put('/admin/reject/:id', protect, adminOnly, rejectPayment);

export default router;
