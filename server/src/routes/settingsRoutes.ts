import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
    updatePreferences,
    changePassword,
    updateTwoFactor,
    updateNotifications,
    downloadData,
    deleteAccount
} from '../controllers/settingsController';

const router = express.Router();

router.put('/preferences', protect, updatePreferences);
router.put('/security/password', protect, changePassword);
router.put('/security/2fa', protect, updateTwoFactor);
router.put('/notifications', protect, updateNotifications);
router.get('/download', protect, downloadData);
router.delete('/account', protect, deleteAccount);

export default router;
