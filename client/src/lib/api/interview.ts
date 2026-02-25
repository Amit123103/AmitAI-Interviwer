
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export const interviewApi = {
    // Resume Analysis & Session Creation
    initiateSession: async (data: {
        userId: string;
        resumeText?: string;
        difficulty?: string;
        targetCompany?: string;
        jobDescription?: string;
        sector?: string;
    }) => {
        const res = await axios.post(`${API_URL}/api/interview/initiate`, data);
        return res.data; // { sessionId, problem, skills }
    },

    // Analyze Resume
    analyzeResume: async (file: File) => {
        const formData = new FormData();
        formData.append('resume', file);
        const res = await axios.post(`${API_URL}/api/resume/analyze`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return res.data; // { analysis: {...} }
    },

    // Start Timer & Set Status to Live
    startSession: async (sessionId: string) => {
        const res = await axios.post(`${API_URL}/api/interview/start`, { sessionId });
        return res.data; // { session, problem }
    },

    // Submit Final Code
    submitSession: async (data: { sessionId: string; code: string; language: string }) => {
        const res = await axios.post(`${API_URL}/api/interview/submit`, data);
        return res.data; // { message, score }
    },

    // Fetch Session State (for rejoining/status check)
    getSession: async (sessionId: string) => {
        const res = await axios.get(`${API_URL}/api/interview/${sessionId}`);
        return res.data;
    }
};
