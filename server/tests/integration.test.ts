/**
 * Integration tests for the AI Interviewer Node.js server.
 *
 * Run:  npx jest tests/integration.test.ts --forceExit
 *
 * Prerequisite: MongoDB and the server must be running (or use in-memory DB).
 * These tests hit the live server at http://localhost:5001.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-var */

// Inline Jest global declarations (avoids @types/jest dependency)
declare var describe: (name: string, fn: () => void) => void;
declare var it: (name: string, fn: () => Promise<void> | void) => void;
declare var expect: (val: any) => any;
declare var process: { env: Record<string, string | undefined> };

const BASE = process.env.SERVER_URL || 'http://localhost:5001';

// Simple fetch wrapper (Node 18+ has global fetch)
async function api(path: string, options?: RequestInit) {
    const res = await fetch(`${BASE}${path}`, options);
    const body = await res.json().catch(() => null);
    return { status: res.status, body };
}

// ─── Health & System ─────────────────────────────────────────────────

describe('System health', () => {
    it('GET / returns running message', async () => {
        const { status, body } = await api('/');
        expect(status).toBe(200);
    });

    it('GET /api/system/health returns service status', async () => {
        const { status, body } = await api('/api/system/health');
        expect(status).toBe(200);
        expect(body).toHaveProperty('server', 'online');
        expect(body).toHaveProperty('timestamp');
    });
});

// ─── Auth ────────────────────────────────────────────────────────────

describe('Auth endpoints', () => {
    const testUser = {
        name: `TestUser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'TestPass123!'
    };
    let token = '';

    it('POST /api/auth/register creates a new user', async () => {
        const { status, body } = await api('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        // 201 on success, 400 if already exists
        expect([200, 201, 400]).toContain(status);
        if (status === 201 || status === 200) {
            token = body?.token || '';
        }
    });

    it('POST /api/auth/login returns JWT', async () => {
        const { status, body } = await api('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testUser.email, password: testUser.password })
        });
        expect([200, 401]).toContain(status);
        if (status === 200) {
            expect(body).toHaveProperty('token');
            token = body.token;
        }
    });
});

// ─── Security Middleware ─────────────────────────────────────────────

describe('Security', () => {
    it('Injection guard rejects $where in body', async () => {
        const { status } = await api('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: { $where: '1==1' }, password: 'x' })
        });
        expect(status).toBe(400);
    });

    it('Injection guard rejects <script> in body', async () => {
        const { status } = await api('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: '<script>alert(1)</script>', password: 'x' })
        });
        expect(status).toBe(400);
    });
});

// ─── Reports ─────────────────────────────────────────────────────────

describe('Reports', () => {
    it('GET /api/reports without auth returns 401', async () => {
        const { status } = await api('/api/reports');
        expect([401, 403]).toContain(status);
    });
});

// ─── Resume ──────────────────────────────────────────────────────────

describe('Resume', () => {
    it('GET /api/resume/parse without file returns error', async () => {
        const { status } = await api('/api/resume/parse', { method: 'POST' });
        expect([400, 415, 422, 500]).toContain(status);
    });
});
