import { Request, Response } from 'express';
import mongoose from 'mongoose';
import CodingRoundSession from '../models/CodingRoundSession';
import Problem from '../models/Problem';
import { executionService } from '../services/executionService';
import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
    apiKey: process.env.OPENAI_API_KEY || 'ollama',
});

const MODEL = process.env.LLM_MODEL || 'llama3.1';

// ─── CV Parsing ──────────────────────────────────────────────────────────────

const LANG_KEYWORDS = ['python', 'javascript', 'typescript', 'java', 'c++', 'cpp', 'golang', 'go', 'ruby', 'kotlin', 'swift', 'rust', 'scala', 'php', 'r', 'matlab'];
const FRAMEWORK_KEYWORDS = ['react', 'angular', 'vue', 'next.js', 'nextjs', 'node', 'express', 'django', 'flask', 'spring', 'fastapi', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'mysql', 'mongodb', 'postgresql', 'redis', 'docker', 'kubernetes', 'aws', 'azure', 'gcp'];
const DOMAIN_KEYWORDS = ['machine learning', 'data science', 'web development', 'backend', 'frontend', 'full stack', 'devops', 'mobile', 'android', 'ios', 'data analysis', 'cloud', 'security', 'networking', 'algorithms', 'data structures'];
const TOPIC_MAP: Record<string, string[]> = {
    'python': ['Arrays', 'Strings', 'Dynamic Programming'],
    'javascript': ['Arrays', 'Strings', 'Trees'],
    'java': ['Arrays', 'Graphs', 'Sorting'],
    'cpp': ['Dynamic Programming', 'Graphs', 'Binary Search'],
    'machine learning': ['Arrays', 'Math', 'Sorting'],
    'data science': ['Arrays', 'Strings', 'Math'],
    'web development': ['Strings', 'Arrays', 'Trees'],
    'algorithms': ['Dynamic Programming', 'Graphs', 'Binary Search'],
};

function parseCVText(cvText: string): Partial<{
    languages: string[]; frameworks: string[]; domains: string[]; tools: string[];
    experienceLevel: 'Entry' | 'Mid' | 'Senior'; suggestedTopics: string[];
}> {
    const lower = cvText.toLowerCase();
    const languages = LANG_KEYWORDS.filter(k => lower.includes(k));
    const frameworks = FRAMEWORK_KEYWORDS.filter(k => lower.includes(k));
    const domains = DOMAIN_KEYWORDS.filter(k => lower.includes(k));

    // Infer experience level
    let expLevel: 'Entry' | 'Mid' | 'Senior' = 'Entry';
    if (lower.includes('senior') || lower.includes('lead') || lower.includes('architect') || lower.includes('principal')) {
        expLevel = 'Senior';
    } else if (lower.includes('mid') || lower.includes('intermediate') || lower.includes('3 years') || lower.includes('4 years') || lower.includes('5 years')) {
        expLevel = 'Mid';
    }

    // Map skills to DSA topics
    const topicSet = new Set<string>();
    [...languages, ...domains].forEach(k => {
        (TOPIC_MAP[k] || []).forEach(t => topicSet.add(t));
    });

    return {
        languages: [...new Set(languages)],
        frameworks: [...new Set(frameworks)],
        domains: [...new Set(domains)],
        tools: [],
        experienceLevel: expLevel,
        suggestedTopics: [...topicSet],
    };
}

// ─── Question Selection ───────────────────────────────────────────────────────

async function selectProblems(
    numQuestions: number,
    difficulty: string,
    language: string,
    cvData?: { languages?: string[]; domains?: string[]; suggestedTopics?: string[] },
    topicPreference?: string
): Promise<any[]> {
    const query: any = {};

    // Difficulty
    if (difficulty !== 'Auto') {
        query.difficulty = difficulty;
    } else {
        // Auto: pick a mix based on CV experience
        query.difficulty = { $in: ['Easy', 'Medium'] };
    }

    // Topic preference from CV or user selection
    const topics = topicPreference
        ? [topicPreference]
        : (cvData?.suggestedTopics || []);

    if (topics.length > 0) {
        query.$or = [
            { category: { $in: topics } },
            { tags: { $in: topics } }
        ];
    }

    let problems = await Problem.find(query)
        .select('_id slug title difficulty category tags examples testCases starterCode constraints description timeLimit memoryLimit')
        .limit(numQuestions * 3); // Fetch extra for randomization

    // Shuffle and pick
    problems = problems.sort(() => Math.random() - 0.5).slice(0, numQuestions);

    // If not enough, fall back to any problems
    if (problems.length < numQuestions) {
        const fallback = await Problem.find({ _id: { $nin: problems.map(p => p._id) } })
            .select('_id slug title difficulty category tags examples testCases starterCode constraints description timeLimit memoryLimit')
            .limit(numQuestions - problems.length);
        problems = [...problems, ...fallback];
    }

    return problems;
}

// ─── AI Evaluation ───────────────────────────────────────────────────────────

async function evaluateSession(session: any): Promise<any> {
    const questions: any[] = session.questions || [];
    const solved = questions.filter((q: any) => q.status === 'accepted').length;
    const attempted = questions.filter((q: any) => ['accepted', 'wrong', 'attempted'].includes(q.status)).length;
    const total = questions.length;
    const accuracyPercent = attempted > 0 ? Math.round((solved / total) * 100) : 0;

    const totalTimeSeconds = questions.reduce((sum: number, q: any) => sum + (q.timeTakenSeconds || 0), 0);
    const avgTimePerQuestion = total > 0 ? totalTimeSeconds / total : 0;

    // Score metrics based on heuristics
    const technicalAccuracy = Math.min(10, Math.round((solved / Math.max(total, 1)) * 10));
    const timeManagement = avgTimePerQuestion < 300 ? 9 : avgTimePerQuestion < 600 ? 7 : 5;
    const debuggingAbility = questions.filter((q: any) => q.status === 'accepted' && (q.submissionResult?.runtime || 0) < 500).length * 2;
    const efficiency = Math.min(10, Math.max(1, debuggingAbility));
    const codeQuality = technicalAccuracy > 7 ? 8 : technicalAccuracy > 4 ? 6 : 4;
    const problemSolving = Math.round((technicalAccuracy + efficiency) / 2);

    const overallScore = Math.round(
        (technicalAccuracy * 0.30 + efficiency * 0.20 + codeQuality * 0.15 + problemSolving * 0.20 + timeManagement * 0.15) * 10
    );

    let readinessLevel: 'Beginner' | 'Developing' | 'Job Ready' | 'Interview Ready' = 'Beginner';
    if (overallScore >= 80) readinessLevel = 'Interview Ready';
    else if (overallScore >= 65) readinessLevel = 'Job Ready';
    else if (overallScore >= 45) readinessLevel = 'Developing';

    // AI feedback per question
    let aiSummary = '';
    try {
        const questionSummaries = questions.map((q: any, i: number) =>
            `Q${i + 1}: "${q.title}" (${q.difficulty}) - Status: ${q.status}, Time: ${q.timeTakenSeconds || 0}s`
        ).join('\n');

        const prompt = `You are an expert coding interview evaluator. A student completed a coding round with these results:

${questionSummaries}

Overall: ${solved}/${total} solved, Accuracy: ${accuracyPercent}%, Total time: ${Math.round(totalTimeSeconds / 60)} minutes.
Student level: ${session.studentDetails?.level || 'Unknown'}.

In 3-4 sentences, give a constructive, encouraging performance summary. Then list 3 specific improvement tips. Format as JSON:
{
  "summary": "...",
  "tips": ["tip1", "tip2", "tip3"]
}`;

        const response = await openai.chat.completions.create({
            model: MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 400,
        });

        const rawContent = response.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(rawContent.match(/\{[\s\S]*\}/)?.[0] || '{}');
        aiSummary = JSON.stringify(parsed);
    } catch (e) {
        aiSummary = JSON.stringify({
            summary: `You solved ${solved} out of ${total} problems with ${accuracyPercent}% accuracy. ${readinessLevel === 'Interview Ready' ? 'Excellent work!' : 'Keep practicing to improve your readiness.'}`,
            tips: ['Practice more dynamic programming problems', 'Focus on optimizing time complexity', 'Review data structure fundamentals']
        });
    }

    return {
        overallScore,
        accuracyPercent,
        questionsSolved: solved,
        readinessLevel,
        metrics: {
            technicalAccuracy,
            efficiency,
            codeQuality,
            problemSolving,
            timeManagement,
            debuggingAbility: Math.min(10, efficiency),
        },
        aiSummary,
    };
}

// ─── Controllers ─────────────────────────────────────────────────────────────

// POST /api/coding-round/start
// Creates session, optionally parses CV text
export const startSession = async (req: Request, res: Response) => {
    try {
        const { userId, studentDetails, cvText, config } = req.body;

        if (!userId || !studentDetails) {
            return res.status(400).json({ error: 'userId and studentDetails are required' });
        }

        let cvData: any = {};
        if (cvText) {
            const parsed = parseCVText(cvText);
            cvData = {
                ...parsed,
                rawText: cvText.slice(0, 5000),
            };
        }

        const session = new CodingRoundSession({
            userId,
            studentDetails,
            cvData: Object.keys(cvData).length ? cvData : undefined,
            config: {
                numQuestions: config?.numQuestions || 5,
                difficulty: config?.difficulty || 'Auto',
                language: config?.language || 'python',
                topic: config?.topic,
            },
            status: 'config',
        });

        await session.save();
        res.status(201).json({ sessionId: session._id, cvData, session });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/coding-round/:sessionId/configure
// Finalize config and generate questions
export const configureSession = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const { numQuestions, difficulty, language, topic } = req.body;

        const session = await CodingRoundSession.findById(sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        // Update config
        session.config = {
            numQuestions: numQuestions || session.config.numQuestions,
            difficulty: difficulty || session.config.difficulty,
            language: language || session.config.language,
            topic: topic || session.config.topic,
        };

        // Generate questions
        const problems = await selectProblems(
            session.config.numQuestions,
            session.config.difficulty,
            session.config.language,
            session.cvData as any,
            session.config.topic
        );

        session.questions = problems.map((p: any) => ({
            problemId: p._id,
            slug: p.slug,
            title: p.title,
            difficulty: p.difficulty,
            status: 'pending',
        }));

        session.status = 'active';
        session.startedAt = new Date();
        await session.save();

        res.json({ session, problemSlugs: problems.map((p: any) => p.slug) });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/coding-round/:sessionId
// Fetch session (with problem details populated on the fly)
export const getSession = async (req: Request, res: Response) => {
    try {
        const session = await CodingRoundSession.findById(req.params.sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        // Fetch current question's full problem data
        const currentQ = session.questions[session.currentQuestionIndex];
        let currentProblem = null;
        if (currentQ?.problemId) {
            currentProblem = await Problem.findById(currentQ.problemId);
            if (currentProblem) {
                // Hide hidden test cases
                const obj = currentProblem.toObject();
                obj.testCases = obj.testCases.filter((tc: any) => !tc.isHidden);
                currentProblem = obj;
            }
        }

        res.json({ session, currentProblem });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/coding-round/:sessionId/run
// Run code for the current question
export const runCode = async (req: Request, res: Response) => {
    try {
        const { code, language, problemId, customInput } = req.body;

        // If customInput is provided, run as script (playground mode)
        if (customInput !== undefined && customInput !== '') {
            const scriptResult = await executionService.runScript(code, language, customInput);
            const statusMap: Record<string, string> = {
                compilation_error: 'Compilation Error',
                runtime_error: 'Runtime Error',
                time_limit_exceeded: 'Time Limit Exceeded',
            };
            return res.json({
                status: scriptResult.errorType ? (statusMap[scriptResult.errorType] || 'Error') : 'Accepted',
                output: scriptResult.stdout || scriptResult.output,
                passed: !scriptResult.errorType,
                results: [],
                runtime: 0,
                memory: 0,
                error: scriptResult.error,
                errorType: scriptResult.errorType,
                stdout: scriptResult.stdout,
                stderr: scriptResult.stderr,
            });
        }

        // Otherwise, run against test cases
        const problem = await Problem.findById(problemId);
        if (!problem) {
            // No problem found — run as plain script
            const scriptResult = await executionService.runScript(code, language, '');
            return res.json({
                status: scriptResult.errorType ? 'Error' : 'Accepted',
                output: scriptResult.stdout || scriptResult.output,
                passed: !scriptResult.errorType,
                results: [],
                runtime: 0,
                memory: 0,
                error: scriptResult.error,
                stdout: scriptResult.stdout,
                stderr: scriptResult.stderr,
            });
        }

        const result = await executionService.execute(code, language, problem);

        const statusMap: Record<string, string> = {
            compilation_error: 'Compilation Error',
            runtime_error: 'Runtime Error',
            time_limit_exceeded: 'Time Limit Exceeded',
            memory_limit_exceeded: 'Memory Limit Exceeded',
        };

        res.json({
            status: result.passed ? 'Accepted' : (result.errorType ? statusMap[result.errorType] : 'Wrong Answer'),
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
};

// POST /api/coding-round/:sessionId/submit-question
// Submit an answer for the current question and advance
export const submitQuestion = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const { code, language, timeTakenSeconds, skipToIndex } = req.body;

        const session = await CodingRoundSession.findById(sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const idx = session.currentQuestionIndex;
        const currentQ = session.questions[idx];
        if (!currentQ) return res.status(400).json({ error: 'No current question' });

        if (code && language) {
            // Run code against test cases
            const problem = await Problem.findById(currentQ.problemId);
            if (problem) {
                const result = await executionService.execute(code, language, problem);
                currentQ.code = code;
                currentQ.language = language;
                currentQ.timeTakenSeconds = timeTakenSeconds || 0;
                currentQ.status = result.passed ? 'accepted' : 'wrong';
                currentQ.submissionResult = {
                    passed: result.passed,
                    runtime: result.stats.runtime,
                    memory: result.stats.memory,
                    testCasesPassed: result.results.filter(r => r.passed).length,
                    totalTestCases: result.results.length,
                    error: result.error,
                };
            }
        } else {
            // Skipped
            currentQ.status = 'skipped';
            currentQ.timeTakenSeconds = timeTakenSeconds || 0;
        }

        // Advance question
        const nextIndex = skipToIndex !== undefined ? skipToIndex : idx + 1;
        session.currentQuestionIndex = nextIndex;

        await session.save();

        const hasMore = nextIndex < session.questions.length;
        res.json({
            questionResult: currentQ,
            hasMore,
            nextIndex,
            isComplete: !hasMore,
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/coding-round/:sessionId/finish
// Finalize session and generate AI report
export const finishSession = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;

        const session = await CodingRoundSession.findById(sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        if (session.status === 'completed') {
            return res.json({ session });
        }

        session.status = 'completed';
        session.finishedAt = new Date();
        session.totalTimeTakenSeconds = session.questions.reduce(
            (sum, q) => sum + (q.timeTakenSeconds || 0), 0
        );

        // Generate evaluation
        const evaluation = await evaluateSession(session);
        session.evaluation = evaluation;

        await session.save();
        res.json({ session });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/coding-round/report/:sessionId
export const getReport = async (req: Request, res: Response) => {
    try {
        const session = await CodingRoundSession.findById(req.params.sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        res.json(session);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/coding-round/user/:userId
export const getUserSessions = async (req: Request, res: Response) => {
    try {
        const sessions = await CodingRoundSession.find({ userId: req.params.userId })
            .select('studentDetails config status evaluation createdAt startedAt')
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(sessions);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
