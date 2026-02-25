
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export interface Problem {
    _id: string;
    slug: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: string;
    tags: string[];
    companies: string[];
    stats: {
        accepted: number;
        submissions: number;
        acceptanceRate: number;
    };
}

export interface ProblemDetail extends Problem {
    description: string;
    starterCode: {
        javascript?: string;
        python?: string;
        java?: string;
        cpp?: string;
    };
    constraints: string[];
    examples: {
        input: string;
        output: string;
        explanation?: string;
    }[];
}

export const codingApi = {
    getProblems: async (params: {
        difficulty?: string;
        category?: string;
        company?: string;
        search?: string;
        page?: number;
        limit?: number
    }) => {
        const query = new URLSearchParams();
        if (params.difficulty && params.difficulty !== 'All') query.append('difficulty', params.difficulty);
        if (params.category && params.category !== 'All') query.append('category', params.category);
        if (params.company && params.company !== 'All') query.append('company', params.company);
        if (params.search) query.append('search', params.search);
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());

        const res = await axios.get(`${API_URL}/api/coding/problems?${query.toString()}`);
        return res.data; // { problems: [], total, page, pages }
    },

    getProblem: async (slug: string) => {
        const res = await axios.get(`${API_URL}/api/coding/problems/${slug}`);
        return res.data as ProblemDetail;
    },

    runCode: async (data: { code: string; language: string; problemId?: string; stdin?: string; customInput?: string }) => {
        const res = await axios.post(`${API_URL}/api/coding/run`, data);
        return res.data;
    },

    submitCode: async (data: { userId: string; problemId: string; code: string; language: string; contestId?: string }) => {
        const res = await axios.post(`${API_URL}/api/coding/submit`, data);
        return res.data;
    },

    getHint: async (data: { problem_title: string; problem_description: string; user_code: string; language: string }) => {
        // AI Service runs on port 8000, but we might gaze it through a backend proxy or direct if CORS allows.
        // For now, assuming backend proxy or direct call if separate.
        // Let's call AI service directly typically, but here we might generally route through server.
        // Current architecture: Client -> Server -> AI Service OR Client -> AI Service.
        // Existing `ai-service` calls seem to be mostly server-side or via specific routes.
        // Let's try direct call to 8000 for MVP since client has access, OR better:
        // Use a server proxy to hide AI URL/Key.
        // I'll assume direct for MVP speed as seen in other modules, or just change logic later.
        // Re-reading: `process.env.NEXT_PUBLIC_AI_URL` or similar? 
        // `main.py` has CORS allowed for *.
        const res = await axios.post('http://localhost:8000/coding/hint', data);
        return res.data;
    },

    analyzeCode: async (data: { problem_title: string; user_code: string; language: string }) => {
        const res = await axios.post('http://localhost:8000/coding/analyze', data);
        return res.data;
    },

    autoFix: async (data: { problem_title: string; user_code: string; language: string; error_message?: string }) => {
        const res = await axios.post('http://localhost:8000/coding/autofix', data);
        return res.data;
    },

    getEdgeCases: async (data: { problem_title: string; problem_description?: string; user_code: string; language: string }) => {
        const res = await axios.post('http://localhost:8000/coding/edge-cases', data);
        return res.data;
    }
};
