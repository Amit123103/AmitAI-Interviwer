import express from 'express';
import { createOrUpdateProfile, getProfile } from '../controllers/profileController';
import { protect } from '../middleware/authMiddleware';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const fs = require('fs');

const uploadDir = 'uploads/resumes/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req: any, file, cb) => {
        const uniqueSuffix = `${req.user!._id}-${Date.now()}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = /application\/pdf|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document/.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only PDF and Word documents are allowed'));
    },
});

const uploadMiddleware = (req: any, res: any, next: any) => {
    upload.single('resume')(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            return res.status(400).json({ message: `File upload error: ${err.message}` });
        } else if (err) {
            // An unknown error occurred when uploading.
            return res.status(400).json({ message: err.message });
        }
        // Everything went fine.
        next();
    });
};

router.route('/')
    .post(protect, uploadMiddleware, createOrUpdateProfile)
    .get(protect, getProfile);

export default router;

