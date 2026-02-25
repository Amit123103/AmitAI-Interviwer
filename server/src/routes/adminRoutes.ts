import express from 'express';
import { getAdminStats, getAllUsers, updateUserRole, updateUserStatus, manualProToggle, exportData, getUserDetails, updateUserDetailed, getSystemConfig, updateSystemConfig, getPredictiveStats, getSystemHealth, getAdminLogs, createUser, deleteUser, createAnnouncement, getAnnouncements, deleteAnnouncement, createResource, getResources, getUpgradeRequests, respondToUpgradeRequest } from '../controllers/analyticsController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/role', protect, adminOnly, updateUserRole);
router.put('/users/status', protect, adminOnly, updateUserStatus);
router.put('/users/pro-manual', protect, adminOnly, manualProToggle);
router.put('/users/detailed', protect, adminOnly, updateUserDetailed);
router.get('/users/:userId/details', protect, adminOnly, getUserDetails);
router.get('/export/:type', protect, adminOnly, exportData);
router.put('/config', protect, adminOnly, updateSystemConfig);
router.get('/predictive-stats', protect, adminOnly, getPredictiveStats);
router.get('/system-health', protect, adminOnly, getSystemHealth);
router.get('/logs', protect, adminOnly, getAdminLogs);

// Phase 5: Student & Platform Nexus
router.post('/users', protect, adminOnly, createUser);
router.delete('/users/:userId', protect, adminOnly, deleteUser);

router.get('/announcements', protect, adminOnly, getAnnouncements);
router.post('/announcements', protect, adminOnly, createAnnouncement);
router.delete('/announcements/:id', protect, adminOnly, deleteAnnouncement);

router.get('/resources', protect, adminOnly, getResources);
router.post('/resources', protect, adminOnly, createResource);

router.get('/upgrade-requests', protect, adminOnly, getUpgradeRequests);
router.post('/upgrade-requests/respond', protect, adminOnly, respondToUpgradeRequest);

export default router;
