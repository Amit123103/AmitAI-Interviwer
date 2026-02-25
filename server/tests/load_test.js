/**
 * Load test for AI Interviewer Server using Autocannon.
 *
 * Run:  node tests/load_test.js
 *
 * Prerequisites: Server must be running on port 5001.
 * autocannon is already in devDependencies.
 */

const autocannon = require('autocannon');

const BASE = process.env.SERVER_URL || 'http://localhost:5001';

async function runTest(label, opts) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`  🔥 ${label}`);
    console.log(`${'─'.repeat(60)}`);

    return new Promise((resolve) => {
        const instance = autocannon({
            url: BASE,
            ...opts
        }, (err, result) => {
            if (err) {
                console.error(`  ❌ Error: ${err.message}`);
            } else {
                console.log(`  Requests/sec : ${result.requests.average}`);
                console.log(`  Latency avg  : ${result.latency.average}ms`);
                console.log(`  Latency p99  : ${result.latency.p99}ms`);
                console.log(`  Throughput   : ${(result.throughput.average / 1024).toFixed(1)} KB/s`);
                console.log(`  Errors       : ${result.errors}`);
                console.log(`  Timeouts     : ${result.timeouts}`);
                console.log(`  2xx          : ${result['2xx']}`);
                console.log(`  Non-2xx      : ${result.non2xx}`);
            }
            resolve(result);
        });
        autocannon.track(instance, { renderResultsTable: false });
    });
}

async function main() {
    console.log('\n🚀 AI Interviewer Load Test Suite');
    console.log(`   Target: ${BASE}`);
    console.log(`   Time  : ${new Date().toISOString()}\n`);

    // 1. Health check — should handle high concurrency easily
    await runTest('Health Check (100 connections, 10s)', {
        url: `${BASE}/api/system/health`,
        connections: 100,
        duration: 10,
        method: 'GET'
    });

    // 2. Auth login — rate limited, expect some 429s
    await runTest('Auth Login (50 connections, 10s)', {
        url: `${BASE}/api/auth/login`,
        connections: 50,
        duration: 10,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'loadtest@example.com',
            password: 'LoadTest123!'
        })
    });

    // 3. Root endpoint — baseline throughput
    await runTest('Root Endpoint (200 connections, 10s)', {
        url: `${BASE}/`,
        connections: 200,
        duration: 10,
        method: 'GET'
    });

    console.log('\n✅ Load tests complete.\n');
}

main().catch(console.error);
