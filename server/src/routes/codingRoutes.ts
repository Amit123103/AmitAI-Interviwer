
import express from 'express';
import Problem from '../models/Problem';
import Submission from '../models/Submission';
import Contest from '../models/Contest';
import mongoose from 'mongoose';
import User from '../models/User';
import { executionService } from '../services/executionService';

const router = express.Router();

// GET /api/coding/problems
// Fetch problems with filters (difficulty, category, company, search)
router.get('/problems', async (req, res) => {
    try {
        const { difficulty, category, company, search, page = 1, limit = 20 } = req.query;
        const query: any = {};

        if (difficulty) query.difficulty = difficulty;
        if (category) query.category = category;
        if (company) query.companies = company;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        const problems = await Problem.find(query)
            .select('title slug difficulty category tags companies stats') // Exclude heavy fields like description/testCases
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .sort({ 'stats.submissions': -1 }); // Popular first

        const total = await Problem.countDocuments(query);

        res.json({ problems, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/coding/problems/:slug
// Fetch single problem details
router.get('/problems/:slug', async (req, res) => {
    try {
        const problem = await Problem.findOne({ slug: req.params.slug });
        if (!problem) return res.status(404).json({ error: "Problem not found" });

        // Hide hidden test cases from client
        const safeProblem = problem.toObject();
        safeProblem.testCases = safeProblem.testCases.filter((tc: any) => !tc.isHidden);

        res.json(safeProblem);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/coding/run
// Execute code against test cases OR run as script with custom input
router.post('/run', async (req, res) => {
    try {
        const { code, language, problemId, stdin, customInput } = req.body;
        const inputStdin = stdin || customInput || '';

        // If no problemId or problem not found, run as script (playground mode)
        if (!problemId) {
            const scriptResult = await executionService.runScript(code, language, inputStdin);
            const statusMap: Record<string, string> = {
                compilation_error: 'Compilation Error',
                runtime_error: 'Runtime Error',
                time_limit_exceeded: 'Time Limit Exceeded',
            };
            return res.json({
                status: scriptResult.errorType ? (statusMap[scriptResult.errorType] || 'Error') : 'Accepted',
                output: scriptResult.stdout || scriptResult.output,
                passed: !scriptResult.errorType,
                runtime: 0,
                memory: 0,
                error: scriptResult.error,
                errorType: scriptResult.errorType,
                stdout: scriptResult.stdout,
                stderr: scriptResult.stderr,
            });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).json({ error: "Problem not found" });

        const result = await executionService.execute(code, language, problem);

        const statusMap: Record<string, string> = {
            compilation_error: 'Compilation Error',
            runtime_error: 'Runtime Error',
            time_limit_exceeded: 'Time Limit Exceeded',
            memory_limit_exceeded: 'Memory Limit Exceeded',
        };

        res.json({
            status: result.passed ? "Accepted" : (result.errorType ? statusMap[result.errorType] : "Wrong Answer"),
            output: result.results.length > 0 ? result.results[0].actual : result.error,
            results: result.results,
            passed: result.passed,
            runtime: result.stats.runtime,
            memory: result.stats.memory,
            error: result.error,
            errorType: result.errorType,
        });

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/coding/submit
// Mock Submission Endpoint
router.post('/submit', async (req, res) => {
    try {
        const { userId, problemId, code, language } = req.body;

        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).json({ error: "Problem not found" });

        // 1. Create Pending Submission
        const submission = new Submission({
            userId,
            problemId,
            code,
            language,
            status: 'Pending'
        });
        await submission.save();

        // 2. Execute Code
        const result = await executionService.execute(code, language, problem);

        // 3. Update Submission
        submission.status = result.passed ? 'Accepted' : result.error ? 'Runtime Error' : 'Wrong Answer';
        submission.runtime = result.stats.runtime;
        submission.memory = result.stats.memory;
        submission.testCasesPassed = result.results.filter(r => r.passed).length;
        submission.totalTestCases = result.results.length;

        if (!result.passed && result.results.length > 0) {
            const firstFail = result.results.find(r => !r.passed);
            if (firstFail) {
                submission.failureDetail = {
                    input: firstFail.input,
                    expectedOutput: firstFail.expected,
                    actualOutput: firstFail.actual,
                    error: firstFail.error || result.error || "Unknown Error"
                };
            }
        }

        if (result.error) {
            submission.failureDetail = {
                input: '-',
                expectedOutput: '-',
                actualOutput: '-',
                error: result.error || "Unknown Error"
            };
        }

        await submission.save();

        // 4. Update User Stats if Accepted
        if (result.passed) {
            await Problem.findByIdAndUpdate(problemId, {
                $inc: { 'stats.accepted': 1, 'stats.submissions': 1 }
            });
            // Update User XP (Gamification hook)
            await User.findByIdAndUpdate(userId, {
                $inc: { xp: 50, 'stats.totalCodeLines': code.split('\n').length }
            });
        } else {
            await Problem.findByIdAndUpdate(problemId, {
                $inc: { 'stats.submissions': 1 }
            });
        }

        // Check if this is a Contest Submission
        // Ideally we pass contestId in the body, or check if problem belongs to active contest
        // For MVP, if `req.body.contestId` exists
        if (req.body.contestId && submission.status === 'Accepted') {
            const contest = await Contest.findById(req.body.contestId);
            if (contest && contest.status === 'Live') {
                const existingEntry = contest.leaderboard.find(e => e.userId.toString() === userId);

                // Simple scoring: 100 points per problem
                const points = 100;

                if (existingEntry) {
                    existingEntry.score += points;
                    // Update finish time (minutes since start)
                    const minutesSinceStart = Math.floor((new Date().getTime() - new Date(contest.startTime).getTime()) / 60000);
                    existingEntry.finishTime = Math.max(existingEntry.finishTime, minutesSinceStart);
                } else {
                    const user = await User.findById(userId);
                    contest.leaderboard.push({
                        userId: new mongoose.Types.ObjectId(userId),
                        username: user?.username || 'Anonymous',
                        score: points,
                        finishTime: Math.floor((new Date().getTime() - new Date(contest.startTime).getTime()) / 60000)
                    });
                }

                await contest.save();

                // Broadcast Update
                // Need IO instance here. Middleware or singleton import.
                const { io } = require('../index'); // Circular dependency cafe? Use app.get('io') or singleton
                io.to(`contest_${contest._id}`).emit('leaderboard-update', contest.leaderboard);
            }
        }

        res.json(submission);

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/coding/user/:userId/stats
// Aggregate user coding statistics
router.get('/user/:userId/stats', async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Fetch all accepted submissions for this user
        // Distinct by problemId to count "Solved" problems, not just submissions
        const solvedProblems = await Submission.find({ userId, status: 'Accepted' }).distinct('problemId');

        // 2. Fetch details of solved problems to group by difficulty
        const problems = await Problem.find({ _id: { $in: solvedProblems } }).select('difficulty');

        const solvedStats = {
            Easy: problems.filter(p => p.difficulty === 'Easy').length,
            Medium: problems.filter(p => p.difficulty === 'Medium').length,
            Hard: problems.filter(p => p.difficulty === 'Hard').length,
            Total: problems.length
        };

        // 3. Calculate Total Submissions & Acceptance Rate
        const totalSubmissions = await Submission.countDocuments({ userId });
        const acceptedSubmissions = await Submission.countDocuments({ userId, status: 'Accepted' });
        const acceptanceRate = totalSubmissions > 0 ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(1) : 0;

        // 4. Generate Activity Heatmap (Last 365 days)
        // Aggregate submissions by date
        const oneYearAgo = new Date();
        oneYearAgo.setDate(oneYearAgo.getDate() - 365);

        const activity = await Submission.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId), createdAt: { $gte: oneYearAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 5. Recent Activity (Last 5)
        const recentActivity = await Submission.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('problemId', 'title slug difficulty');

        res.json({
            solved: solvedStats,
            totalSubmissions,
            acceptanceRate,
            activity: activity.map(a => ({ date: a._id, count: a.count })),
            recent: recentActivity
        });

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
