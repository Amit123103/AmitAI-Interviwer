
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export interface Contest {
    _id: string;
    title: string;
    description: string;
    startTime: string; // Date string
    endTime: string;
    status: 'Upcoming' | 'Live' | 'Ended';
    participants: string[]; // User IDs
    prizes: string[];
    problems?: {
        _id: string;
        title: string;
        slug: string;
        difficulty: string;
        category: string;
    }[];
    leaderboard?: {
        userId: string;
        username: string;
        score: number;
        finishTime: number;
    }[];
}

export const contestApi = {
    getContests: async (status?: string) => {
        const query = status ? `?status=${status}` : '';
        const res = await axios.get(`${API_URL}/api/contests${query}`);
        return res.data;
    },

    getContest: async (id: string) => {
        const res = await axios.get(`${API_URL}/api/contests/${id}`);
        return res.data;
    },

    register: async (id: string, userId: string) => {
        const res = await axios.post(`${API_URL}/api/contests/${id}/register`, { userId });
        return res.data;
    },

    getLeaderboard: async (id: string) => {
        const res = await axios.get(`${API_URL}/api/contests/${id}/leaderboard`);
        return res.data;
    }
};
