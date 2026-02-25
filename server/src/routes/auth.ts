import express from 'express';
import { registerUser, loginUser, forgotPassword, resetPassword } from '../controllers/authController';
import { sendTestEmail } from '../services/emailService';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ── Debug: test email delivery (remove in production) ──
router.post('/test-email', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    try {
        const success = await sendTestEmail(email);
        res.json({ success, message: success ? 'Test email sent!' : 'Failed — check server logs' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
