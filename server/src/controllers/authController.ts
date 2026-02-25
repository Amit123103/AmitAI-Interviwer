import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/emailService';

const generateToken = (id: string, role: string) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

export const registerUser = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    try {
        console.log("Registration attempt:", { username, email });

        // Check if user already exists in MongoDB
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user in MongoDB
        const newUser = await User.create({
            username,
            email,
            passwordHash,
        });

        if (newUser) {
            console.log("User created successfully:", newUser._id);

            sendWelcomeEmail(newUser.email, newUser.username).catch(err => {
                console.error("Welcome email failed (non-fatal):", err.message);
            });

            // Broadcast signup event
            if ((global as any).broadcastAdminEvent) {
                (global as any).broadcastAdminEvent('user:signup', {
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role
                });
            }

            res.status(201).json({
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                token: generateToken(newUser._id.toString(), newUser.role),
                preferences: newUser.preferences || { theme: 'dark', language: 'English' },
                twoFactorEnabled: newUser.twoFactorEnabled || false
            });
        }
    } catch (error: any) {
        console.error("Signup error details:", error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { identifier, password } = req.body;

    try {
        // Query MongoDB — find by email or username
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });

        if (user && (await bcrypt.compare(password, user.passwordHash))) {
            // Check account status
            if (user.accountStatus === 'suspended') {
                return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
            }

            // Log login activity
            try {
                const LoginLog = require('../models/LoginLog').default;
                LoginLog.create({
                    userId: user._id,
                    email: user.email,
                    ipAddress: req.ip || 'unknown',
                    userAgent: req.headers['user-agent'] || 'unknown',
                    timestamp: new Date()
                }).catch((err: any) => console.error('[AUTH] Login log failed:', err));
            } catch (e) {
                // LoginLog model may not exist — non-fatal
            }

            // Broadcast login event
            if ((global as any).broadcastAdminEvent) {
                (global as any).broadcastAdminEvent('user:login', {
                    userId: user._id,
                    username: user.username,
                    role: user.role
                });
            }

            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id.toString(), user.role),
                preferences: user.preferences || { theme: 'dark', language: 'English' },
                twoFactorEnabled: user.twoFactorEnabled || false
            });
        } else {
            res.status(401).json({ message: 'Invalid email/username or password' });
        }
    } catch (error: any) {
        console.error("Login error:", error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// ── Forgot Password — generate token, send reset email ──
export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        console.log(`[AUTH] Forgot password request for: ${email}`);

        // Always return success to prevent email enumeration
        const successMsg = 'If an account exists with this email, a reset link has been sent.';

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            console.log(`[AUTH] No user found for email: ${email} (returning generic success)`);
            return res.json({ message: successMsg });
        }

        // Generate secure token
        const rawToken = crypto.randomBytes(32).toString('hex');
        console.log(`[AUTH] Reset token generated for user: ${user._id}`);

        // Store SHA-256 hash of token (never store raw token in DB)
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await user.save();
        console.log(`[AUTH] Token saved to DB, expires at: ${user.resetPasswordExpires}`);

        // Build reset URL with raw token (user receives this in email)
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const resetUrl = `${clientUrl}/auth/reset-password?token=${rawToken}`;
        console.log(`[AUTH] Reset URL generated: ${clientUrl}/auth/reset-password?token=***`);

        // Send email — errors propagate from sendPasswordResetEmail
        try {
            await sendPasswordResetEmail(user.email, resetUrl, user.username);
            console.log(`[AUTH] Reset email dispatched successfully to: ${user.email}`);
        } catch (emailError: any) {
            console.error(`[AUTH] ❌ Failed to send reset email: ${emailError.message}`);
            // Still return success to prevent email enumeration,
            // but log the failure prominently
            console.error('[AUTH] ⚠️  User will NOT receive the reset email!');
            console.error('[AUTH] ⚠️  Check SMTP configuration in .env file');
        }

        res.json({ message: successMsg });
    } catch (error: any) {
        console.error("[AUTH] Forgot password error:", error.message);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// ── Reset Password — validate token, update password ──
export const resetPassword = async (req: Request, res: Response) => {
    const { token, password, confirmPassword } = req.body;

    try {
        if (!token || !password) {
            return res.status(400).json({ message: 'Token and password are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Password strength validation
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }
        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
        }
        if (!/[a-z]/.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
        }
        if (!/[0-9]/.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one number' });
        }

        // Hash the token to compare with stored hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }, // Not expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token. Please request a new reset link.' });
        }

        // Hash new password and save
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(password, salt);

        // Invalidate token (single-use)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        console.log(`Password reset successful for user: ${user.email}`);
        res.json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

