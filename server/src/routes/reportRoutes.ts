import express, { Request } from 'express';
import { createReport, getReportsByUser, getReportById, getStats, analyzeResume, analyzeFrame, getAllReports } from '../controllers/reportController';
import { protect, adminOnly } from '../middleware/authMiddleware';

import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Ensure upload directory exists
const uploadDir = 'uploads/interviews/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req: Request, file: any, cb: any) => {
        cb(null, uploadDir);
    },
    filename: (req: Request, file: any, cb: any) => {
        let prefix = 'interview';
        if (file.fieldname === 'resume') prefix = 'resume';
        if (file.fieldname === 'frame') prefix = 'frame';
        cb(null, `${prefix}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });

router.post('/', upload.single('video'), createReport);
router.post('/analyze-resume', upload.single('resume'), analyzeResume);
router.post('/analyze-frame', upload.single('frame'), analyzeFrame);

// Admin Routes
router.get('/all', protect, adminOnly, getAllReports);

router.get('/stats/:userId', getStats);
router.get('/user/:userId', getReportsByUser);
router.get('/:id', getReportById);

export default router;
