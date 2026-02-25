import express from 'express';
import {
    startSession,
    configureSession,
    getSession,
    runCode,
    submitQuestion,
    finishSession,
    getReport,
    getUserSessions,
} from '../controllers/codingRoundController';
import multer from 'multer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>;

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// POST /api/coding-round/start — create session (with optional plain text CV)
router.post('/start', startSession);

// POST /api/coding-round/upload-cv — parse PDF/DOC CV and return extracted text
router.post('/upload-cv', upload.single('cv'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        let cvText = '';
        if (req.file.mimetype === 'application/pdf') {
            const parsed = await pdfParse(req.file.buffer);
            cvText = parsed.text;
        } else {
            // For DOC/DOCX: basic text extraction (strip binary noise)
            cvText = req.file.buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r]/g, ' ').slice(0, 8000);
        }

        res.json({ cvText: cvText.slice(0, 8000) });
    } catch (err: any) {
        res.status(500).json({ error: 'CV parsing failed: ' + err.message });
    }
});

// POST /api/coding-round/:sessionId/configure — finalize config + generate questions
router.post('/:sessionId/configure', configureSession);

// GET /api/coding-round/:sessionId — fetch session + current problem
router.get('/:sessionId', getSession);

// POST /api/coding-round/:sessionId/run — run code 
router.post('/:sessionId/run', runCode);

// POST /api/coding-round/:sessionId/submit-question — submit answer and advance
router.post('/:sessionId/submit-question', submitQuestion);

// POST /api/coding-round/:sessionId/finish — finalize + evaluate
router.post('/:sessionId/finish', finishSession);

// GET /api/coding-round/report/:sessionId — get full report
router.get('/report/:sessionId', getReport);

// GET /api/coding-round/user/:userId — list user sessions
router.get('/user/:userId', getUserSessions);

export default router;
