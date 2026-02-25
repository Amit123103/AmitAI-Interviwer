import express from 'express';
import axios from 'axios';

const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

router.get('/status', async (req, res) => {
    let aiStatus = 'offline';
    let ollamaStatus = 'offline';
    let mongoStatus = 'offline';

    // Check AI Service
    try {
        const response = await axios.get(`${AI_SERVICE_URL}/`, { timeout: 3000 });
        if (response.status === 200) aiStatus = 'online';
    } catch (error) { }

    // Check Ollama
    try {
        const response = await axios.get(`${process.env.OLLAMA_URL || 'http://localhost:11434'}/api/tags`, { timeout: 3000 });
        if (response.status === 200) ollamaStatus = 'online';
    } catch (error) { }

    // Check MongoDB
    try {
        const mongoose = require('mongoose');
        mongoStatus = mongoose.connection.readyState === 1 ? 'online' : 'reconnecting';
    } catch (error) { }

    res.json({
        backend: 'online',
        ai_service: aiStatus,
        ollama: ollamaStatus,
        mongodb: mongoStatus,
        timestamp: new Date().toISOString(),
        config: {
            ai_service_timeout: "180s",
            retry_attempts: 2
        }
    });
});

export default router;
