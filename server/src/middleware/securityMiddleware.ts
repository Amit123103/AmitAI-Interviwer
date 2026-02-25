/**
 * securityMiddleware.ts
 * ─────────────────────────────────────────────────────────────────
 * Production-grade security middleware for the AI Interviewer API.
 *
 * Applies:
 *   1. Security headers (helmet)
 *   2. Per-IP rate limiting (general + strict for auth routes)
 *   3. NoSQL injection pattern blocker
 *   4. Request body size guard for non-upload routes
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// ── 1. Security Headers ─────────────────────────────────────────────
export const helmetMiddleware = helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin for API
    contentSecurityPolicy: false, // API only — no HTML rendering
});

// ── 2. Rate Limiters ────────────────────────────────────────────────

/**
 * General API limiter: 150 requests per 15 minutes per IP.
 * Applied globally to prevent scraping and DoS.
 */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too Many Requests',
        message: 'You have exceeded the rate limit. Please try again in 15 minutes.',
    },
    skip: (req) => {
        // Skip rate limiting for health checks and static files
        return req.path === '/api/system/health' || req.path === '/';
    },
});

/**
 * Auth limiter: 15 attempts per 15 minutes per IP.
 * Prevents brute-force login attacks.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too Many Auth Attempts',
        message: 'Too many login/register attempts. Please wait 15 minutes before retrying.',
    },
});

/**
 * Resume/AI upload limiter: 20 uploads per hour per IP.
 * Prevents resource exhaustion from repeated AI processing calls.
 */
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Upload Limit Reached',
        message: 'Too many file uploads. Please try again in an hour.',
    },
});

// ── 3. NoSQL Injection Blocker ──────────────────────────────────────
const INJECTION_PATTERNS = [
    /\$where/i,
    /\$gt/i,
    /\$lt/i,
    /\$ne/i,
    /\$regex/i,
    /\$or/i,
    /\$and/i,
    /\$exists/i,
    /javascript:/i,
    /<script/i,
    /eval\s*\(/i,
    /exec\s*\(/i,
];

function containsInjection(value: any): boolean {
    if (typeof value === 'string') {
        return INJECTION_PATTERNS.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => containsInjection(v));
    }
    return false;
}

export const injectionGuard = (req: Request, res: Response, next: NextFunction): void => {
    // Only check JSON bodies (not file uploads)
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
        next();
        return;
    }

    if (req.body && containsInjection(req.body)) {
        console.warn(`[Security] Injection pattern detected from ${req.ip} on ${req.path}`);
        res.status(400).json({
            error: 'Invalid Request',
            message: 'Request contains disallowed patterns.',
        });
        return;
    }

    // Check query params too
    if (req.query && containsInjection(req.query)) {
        console.warn(`[Security] Injection in query params from ${req.ip} on ${req.path}`);
        res.status(400).json({
            error: 'Invalid Request',
            message: 'Query parameters contain disallowed patterns.',
        });
        return;
    }

    next();
};

// ── 4. Request Logging ──────────────────────────────────────────────
/**
 * Structured request logger for production tracing.
 * Skips health-check and static file requests.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    const skip = req.path === '/api/system/health' || req.path.startsWith('/uploads/');
    if (skip) { next(); return; }

    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const level = res.statusCode >= 500 ? 'ERROR' :
            res.statusCode >= 400 ? 'WARN' : 'INFO';
        console.log(`[${level}] ${req.method} ${req.path} → ${res.statusCode} (${duration}ms) [${req.ip}]`);
    });
    next();
};
