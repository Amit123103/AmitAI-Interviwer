import { Request, Response } from 'express';
import User from '../models/User';
import Profile from '../models/Profile';
import bcrypt from 'bcryptjs';
import archiver from 'archiver';
import Report from '../models/Report';

// --- Preferences ---
export const updatePreferences = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.preferences = { ...user.preferences, ...req.body };
        await user.save();

        res.json({ preferences: user.preferences });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- Security ---
export const changePassword = async (req: any, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid current password' });

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateTwoFactor = async (req: any, res: Response) => {
    const { enabled } = req.body;
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.twoFactorEnabled = enabled;
        await user.save();

        res.json({ twoFactorEnabled: user.twoFactorEnabled });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- Notifications ---
export const updateNotifications = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.preferences.notifications = { ...user.preferences.notifications, ...req.body };
        await user.save();

        res.json({ notifications: user.preferences.notifications });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- Privacy ---
export const downloadData = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user._id).select('-passwordHash');
        const profile = await Profile.findOne({ userId: req.user._id });
        const reports = await Report.find({ userId: req.user._id });

        if (!user) return res.status(404).json({ message: 'User not found' });

        const archive = archiver('zip', { zlib: { level: 9 } });

        res.attachment(`user_data_${user._id}.zip`);
        archive.pipe(res);

        archive.append(JSON.stringify(user, null, 2), { name: 'user_account.json' });
        if (profile) archive.append(JSON.stringify(profile, null, 2), { name: 'user_profile.json' });

        const reportsJson = JSON.stringify(reports, null, 2);
        archive.append(reportsJson, { name: 'interview_history.json' });

        await archive.finalize();

    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteAccount = async (req: any, res: Response) => {
    const { password } = req.body;
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

        // Delete all related data
        await Profile.deleteOne({ userId: user._id });
        await Report.deleteMany({ userId: user._id });
        await User.deleteOne({ _id: user._id });

        res.json({ message: 'Account deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
