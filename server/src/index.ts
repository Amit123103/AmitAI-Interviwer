import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import path from 'path';
import connectDB from './config/db';
import { startHealthMonitor, waitForAI, ServiceStatus } from './services/healthMonitor';
import {
    helmetMiddleware,
    generalLimiter,
    authLimiter,
    uploadLimiter,
    injectionGuard,
    requestLogger,
} from './middleware/securityMiddleware';

// ── Bootstrap: Load env ONCE ────────────────────────────────────────
dotenv.config();

// ── Global Error Handlers (MUST be registered before anything else) ─
// These prevent nodemon from crashing on unhandled async errors.
process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception — server staying alive:', err.message);
    console.error(err.stack);
    // Do NOT call process.exit() — let nodemon keep the server alive
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[ERROR] Unhandled Promise Rejection at:', promise);
    console.error('[ERROR] Reason:', reason);
    // Do NOT exit — the server continues; the specific request fails gracefully
});

// ── Graceful Shutdown ───────────────────────────────────────────────
function gracefulShutdown(signal: string) {
    console.log(`\n[SERVER] ${signal} received — shutting down gracefully…`);
    server.close(() => {
        console.log('[SERVER] HTTP server closed.');
        process.exit(0);
    });
    // Force exit after 10s if connections are hanging
    setTimeout(() => { process.exit(1); }, 10_000);
}

// ── Connect to MongoDB (non-fatal) ─────────────────────────────────
connectDB().catch((err: Error) => {
    console.error('[DB] MongoDB connection failed at startup:', err.message);
    console.warn('[DB] Server will continue — retrying in background…');
});

// ── Express App ─────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',')
        : ['http://localhost:3000'],
    credentials: true,
}));
app.use(helmetMiddleware);      // Security headers
app.use(generalLimiter);       // Global rate limit
app.use(requestLogger);        // Structured request logging
app.use(injectionGuard);       // NoSQL injection blocker

// Payments route before express.json() to preserve raw webhook body
import paymentRoutes from './routes/paymentRoutes';
app.use('/api/payments', paymentRoutes);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (_req, res) => {
    res.send('AI Interviewer API is running…');
});

// ── System status endpoint ──────────────────────────────────────────
app.get('/api/system/health', (_req, res) => {
    res.json({
        server: 'online',
        ...ServiceStatus,
        timestamp: new Date().toISOString(),
    });
});

// ── Route imports (lazy — after middleware is applied) ──────────────
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import reportRoutes from './routes/reportRoutes';
import executionRoutes from './routes/executionRoutes';
import forumRoutes from './routes/forumRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import reviewRoutes from './routes/reviewRoutes';
import negotiationRoutes from './routes/negotiationRoutes';
import onsiteRoutes from './routes/onsiteRoutes';
import systemRoutes from './routes/systemRoutes';
import settingsRoutes from './routes/settingsRoutes';
import codingRoutes from './routes/codingRoutes';
import codingRoundRoutes from './routes/codingRoundRoutes';
import gamificationRoutes from './routes/gamificationRoutes';
import interviewRoutes from './routes/interviewRoutes';
import contestRoutes from './routes/contestRoutes';
import resumeRoutes from './routes/resumeRoutes';
import practiceRoutes from './routes/practiceRoutes';
import questionRoutes from './routes/questionRoutes';
import companyRoutes from './routes/companyRoutes';
import contentRoutes from './routes/contentRoutes'
import adminRoutes from './routes/adminRoutes'
import proSubscriptionRoutes from './routes/proSubscriptionRoutes'
import sqlRoutes from './routes/sqlRoutes'

app.use('/api/auth', authLimiter, authRoutes);   // Stricter limit on auth
app.use('/api/profile', profileRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/execution', executionRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/onsite', onsiteRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/negotiation', negotiationRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/database', sqlRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/user', contentRoutes); // Alias for user activity
app.use('/api/user/settings', settingsRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/coding', codingRoutes);
app.use('/api/coding-round', codingRoundRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/resume', uploadLimiter, resumeRoutes);  // Upload-rate-limited
app.use('/api/practice', practiceRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pro', uploadLimiter, proSubscriptionRoutes);

// ── Socket.IO ───────────────────────────────────────────────────────
import { initializeSocket } from './socket/index';
const io = initializeSocket(server);
export { io };

// ── Start Server ─────────────────────────────────────────────────────
// ── Cron Jobs (Automation) ──────────────────────────────────────────
import { initCronJobs } from './services/cronJobs';
initCronJobs();

const PORT = Number(process.env.PORT) || 5001;

server.listen(PORT, async () => {
    console.log(`\n🚀 SERVER [V3_STABLE] running on port ${PORT}`);
    console.log('─────────────────────────────────────────');
    console.log('  Running startup diagnostics…');
    console.log('─────────────────────────────────────────');

    // Check MongoDB (synchronous state at this point)
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
        console.log('  ✅ MongoDB: Connected');
    } else {
        console.warn('  ⚠️  MongoDB: Connecting (check MONGO_URI)');
    }

    // Check Ollama (single attempt, non-critical)
    const axios = require('axios');
    try {
        await axios.get(`${process.env.OLLAMA_URL || 'http://localhost:11434'}/api/tags`, { timeout: 5000 });
        console.log('  ✅ Ollama Local: Online');
        ServiceStatus.ollama = true;
    } catch {
        console.warn('  ⚠️  Ollama Local: Offline (fallback mode active)');
    }

    // Wait for AI service with exponential backoff (3 retries: 3s → 6s → 12s)
    console.log('  🔄 AI Service: Checking…');
    await waitForAI(10, 3000);

    if (ServiceStatus.ai) {
        console.log('  ✅ AI Service: Online');
    } else {
        console.warn('  ❌ AI Service: Offline — server in DEGRADED mode');
        console.warn('     → Start FastAPI with: cd ai-service && start_service.bat');
    }

    console.log('─────────────────────────────────────────');
    console.log('  System ready. Background health checks active.\n');

    // Verify email transporter (non-blocking)
    const { verifyEmailTransporter } = require('./services/emailService');
    verifyEmailTransporter().then((ok: boolean) => {
        if (!ok) {
            console.warn('  ⚠️  Email: NOT configured — password reset emails will not be sent');
            console.warn('     → Create a .env file with SMTP_HOST, SMTP_USER, SMTP_PASS');
        }
    }).catch(() => { });


    // Start background health monitor (polls every 30s)
    startHealthMonitor();
});

// Handle server-level errors (e.g. EADDRINUSE)
server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n[SERVER] ❌ Port ${PORT} is already in use!`);
        console.error(`[SERVER]    Run: npx kill-port ${PORT}  OR  npm run dev (predev script handles this)`);
        process.exit(1);
    } else {
        console.error('[SERVER] Unexpected server error:', err);
    }
});

// Register graceful shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
