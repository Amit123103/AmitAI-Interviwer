
import mongoose from 'mongoose';
import Contest from '../src/models/Contest';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interview-platform';

const CONTESTS = [
    {
        title: "Weekly Contest 400",
        description: "Join the weekly contest to test your skills! 4 Problems, 90 Minutes.",
        startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 90),
        status: 'Upcoming',
        participants: [],
        problems: [], // Will need to link to real problems in production
        leaderboard: [],
        prizes: ["500 XP", "Gold Badge"]
    },
    {
        title: "Bi-Weekly Speedrun",
        description: "Fast-paced contest for speed coders. 2 Problems, 30 Minutes.",
        startTime: new Date(Date.now() + 1000 * 60 * 60 * 5), // 5 hours from now
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 5 + 1000 * 60 * 30),
        status: 'Upcoming',
        participants: [],
        problems: [],
        leaderboard: [],
        prizes: ["200 XP", "Speedster Badge"]
    },
    {
        title: "Mock Interview League",
        description: "Simulated interview problems. 3 Problems, 60 Minutes.",
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // Yesterday (Ended)
        endTime: new Date(Date.now() - 1000 * 60 * 60 * 23),
        status: 'Ended',
        participants: [],
        problems: [],
        leaderboard: [
            { username: "algo_master", score: 300, finishTime: 45 },
            { username: "code_ninja", score: 200, finishTime: 50 },
            { username: "bug_hunter", score: 100, finishTime: 55 }
        ],
        prizes: ["300 XP"]
    },
    {
        title: "Global Coding Challenge",
        description: "Compete with developers worldwide. 5 Problems, 2 Hours.",
        startTime: new Date(), // Now (Live)
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 2),
        status: 'Live',
        participants: [],
        problems: [],
        leaderboard: [],
        prizes: ["1000 XP", "Platinum Badge", "Pro Subscription"]
    }
];

const seedContests = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connnected to DB');

        // Clear existing contests
        await Contest.deleteMany({});
        console.log('Cleared existing contests');

        await Contest.insertMany(CONTESTS);
        console.log(`Seeded ${CONTESTS.length} contests`);

        await mongoose.disconnect();
        console.log('Done');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedContests();
