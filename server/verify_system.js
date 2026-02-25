const axios = require('axios');

const API_URL = 'http://localhost:5001';
const AI_SERVICE_URL = 'http://localhost:8000';

async function verifySystem() {
    console.log("Starting System Verification...");

    // 1. Check System Status
    try {
        console.log("Checking System Status Endpoint...");
        const res = await axios.get(`${API_URL}/api/system/status`);
        console.log("✅ System Status Code:", res.status);
        console.log("✅ System Status Data:", JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error("❌ System Status Failed:", error.message);
        if (error.response) console.error("Response:", error.response.data);
    }

    // 2. Check AI Service Directly
    try {
        console.log("\nChecking AI Service Root...");
        const res = await axios.get(`${AI_SERVICE_URL}/`);
        console.log("✅ AI Service Root Code:", res.status);
    } catch (error) {
        console.log("ℹ️ AI Service Root might be 404 (expected if no root route), checking /docs...");
        try {
            const resDocs = await axios.get(`${AI_SERVICE_URL}/docs`);
            console.log("✅ AI Service Docs Code:", resDocs.status);
        } catch (errDocs) {
            console.error("❌ AI Service Unreachable:", errDocs.message);
        }
    }

    // 3. Check Authentication (Login) - using a known test user if possible, or failing gracefully
    console.log("\nChecking Auth (Login)...");
    try {
        await axios.post(`${API_URL}/api/auth/login`, {
            identifier: "testuser",
            password: "wrongpassword"
        });
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log("✅ Auth Login Endpoint reachable (401 Unauthorized as expected for bad creds).");
        } else {
            console.error("❌ Auth Login Endpoint Failed:", error.message);
        }
    }

    console.log("\nVerification Complete.");
}

verifySystem();
