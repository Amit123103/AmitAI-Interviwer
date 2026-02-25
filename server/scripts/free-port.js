/**
 * free-port.js
 * Usage: node scripts/free-port.js <port>
 *
 * Finds and kills any processes listening on the given port.
 * Designed for the `predev` npm script on Windows.
 */

'use strict';
const { execSync } = require('child_process');

const port = process.argv[2] || '5001';
console.log(`[free-port] Checking for processes on port ${port}…`);

try {
    const stdout = execSync(`netstat -ano | findstr LISTENING | findstr :${port}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
    });

    const lines = stdout.trim().split('\n').filter(Boolean);
    const pids = new Set();

    for (const line of lines) {
        // netstat line: Proto  Local Address          Foreign Address        State           PID
        const parts = line.trim().split(/\s+/);
        const localAddr = parts[1] || '';
        const pid = parts[parts.length - 1];

        // Only target exact port match (e.g. :::5001 or 0.0.0.0:5001)
        if (!localAddr.endsWith(`:${port}`)) continue;
        if (!pid || pid === '0') continue;

        pids.add(pid);
    }

    if (pids.size === 0) {
        console.log(`[free-port] Port ${port} is free. Nothing to kill.`);
        process.exit(0);
    }

    for (const pid of pids) {
        try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'pipe' });
            console.log(`[free-port] ✅ Killed PID ${pid} (was holding port ${port}).`);
        } catch (killErr) {
            // PID may have already exited — safe to ignore
            console.log(`[free-port] PID ${pid} could not be killed (may have already exited).`);
        }
    }
} catch (e) {
    // findstr returns exit code 1 when no matches — that's fine
    console.log(`[free-port] Port ${port} is free. Nothing to kill.`);
}
