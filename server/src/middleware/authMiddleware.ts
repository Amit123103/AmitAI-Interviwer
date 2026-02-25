import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface DecodedToken {
    id: string;
    role: string;
}

export const protect = async (req: any, res: Response, Next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as DecodedToken;

            // Query MongoDB for user
            const user = await User.findById(decoded.id).select('-passwordHash');

            if (!user) {
                console.error("Protect Middleware: User not found for ID", decoded.id);
                return res.status(401).json({ message: 'User not found' });
            }

            // Construct authority object (compatible with existing code)
            req.user = {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                accountStatus: user.accountStatus,
                xp: user.xp,
                level: user.level,
                streak: user.streak,
                proSubscription: user.proSubscription || { isActive: false, plan: null },
                preferences: user.preferences || {}
            };

            Next();
        } catch (error) {
            console.error("Protect Middleware Error:", error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        console.error("Protect Middleware: No token provided");
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const adminOnly = (req: any, res: Response, Next: NextFunction) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'sub-admin')) {
        Next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

export const requirePro = async (req: any, res: Response, Next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const proSub = req.user.proSubscription;

        // Admin/Sub-Admin bypasses Pro check
        if (req.user.role === 'admin' || req.user.role === 'sub-admin') return Next();

        if (!proSub || !proSub.isActive) {
            return res.status(403).json({
                message: 'Pro subscription required. Upgrade to access this feature.',
                requiresPro: true,
            });
        }

        // Check expiry
        if (proSub.expiryDate && new Date(proSub.expiryDate) < new Date()) {
            // Auto-disable expired subscription in MongoDB
            await User.findByIdAndUpdate(req.user._id, {
                'proSubscription.isActive': false,
                'proSubscription.plan': null,
                'subscriptionStatus': 'free'
            });

            return res.status(403).json({
                message: 'Your Pro subscription has expired. Please renew to continue accessing Pro features.',
                requiresPro: true,
                expired: true,
            });
        }

        Next();
    } catch (error) {
        console.error('RequirePro middleware error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
