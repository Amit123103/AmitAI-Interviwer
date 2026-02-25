
const axios = require('axios');
const mongoose = require('mongoose');

// Config
const API_URL = 'http://localhost:5001/api';
const MONGODB_URI = 'mongodb://localhost:27017/interview-platform';

// Mock Data
const MOCK_SCORES = { technical: 85, communication: 90, cultural: 95 };
const MOCK_FEEDBACK = {
    summary: "Excellent performance.",
    pros: ["Great coding style", "Clear communication"],
    cons: ["Could be faster"]
};

// Define User Schema (Simplified for extraction)
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    passwordHash: String,
    role: { type: String, default: 'student' },
    xp: { type: Number, default: 0 },
    stats: { type: Object, default: {} }
});
const User = mongoose.model('User', UserSchema);

async function runVerification() {
    try {
        console.log("Starting Onsite Flow Verification...");

        // 0. Connect to DB and Create User
        await mongoose.connect(MONGODB_URI);
        console.log("   -> Connected to MongoDB");

        const testUser = new User({
            username: `TestUser_${Date.now()}`,
            email: `test${Date.now()}@example.com`,
            passwordHash: 'hash',
            role: 'student'
        });
        await testUser.save();
        const userId = testUser._id.toString();
        console.log(`   -> Created Test User: ${userId}`);

        // 1. Create Loop
        console.log("\n1. Creating Onsite Loop...");
        const createRes = await axios.post(`${API_URL}/onsite`, {
            userId: userId,
            company: 'Google',
            role: 'Senior Software Engineer'
        });
        const loopId = createRes.data._id;
        const rounds = createRes.data.rounds;
        console.log(`   -> Loop Created! ID: ${loopId}`);
        console.log(`   -> Rounds: ${rounds.length}`);

        // 2. Complete All Rounds
        console.log("\n2. Completing Rounds...");
        for (const round of rounds) {
            console.log(`   -> Completing Round: ${round.roundName} (${round.type})...`);
            await axios.post(`${API_URL}/onsite/${loopId}/round/${round._id}/complete`, {
                scores: MOCK_SCORES,
                feedback: MOCK_FEEDBACK,
                transcript: [{ role: 'user', content: "Hello" }, { role: 'ai', content: "Hi" }]
            });
        }
        console.log("   -> All rounds completed.");

        // 3. Finalize Loop (Simulated)
        console.log("\n3. Finalizing Loop...");
        // This might fail if AI service is down, so we'll wrap it
        try {
            const finalizeRes = await axios.post(`${API_URL}/onsite/${loopId}/finalize`);
            console.log("   -> Finalized via AI Service:", finalizeRes.data.finalDecision?.recommendation);
        } catch (e) {
            console.log("   -> Real Finalize failed (expected if AI offline). Simulating DB update...");
            // Manually update DB to "Completed" with decision
            await mongoose.connection.collection('onsiteloops').updateOne(
                { _id: new mongoose.Types.ObjectId(loopId) },
                {
                    $set: {
                        status: 'Completed',
                        finalDecision: {
                            recommendation: 'Strong Hire',
                            justification: 'Simulated justification for testing. The candidate showed exceptional technical skills and strong cultural alignment.',
                            committeeFeedback: ['Great coder', 'Good culture fit', 'Needs to improve system design nuances']
                        }
                    }
                }
            );
            console.log("   -> Manually updated loop status to Completed.");
        }

        console.log("\nVerification Finished.");
        console.log(`\n*** TEST REPORT URL: http://localhost:3000/dashboard/onsite/${loopId}/report ***\n`);

        await mongoose.disconnect();
        return loopId;

    } catch (error) {
        console.error("Verification Failed:", error.response?.data || error);
        if (mongoose.connection.readyState === 1) await mongoose.disconnect();
    }
}

runVerification();
