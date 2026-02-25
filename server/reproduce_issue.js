const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const API_URL = 'http://localhost:5001';

async function reproduce() {
    try {
        // 1. Register
        const email = `test${Date.now()}@example.com`;
        console.log(`Registering ${email}...`);
        try {
            await axios.post(`${API_URL}/api/auth/register`, {
                username: `user${Date.now()}`,
                email,
                password: 'password123'
            });
        } catch (e) {
            console.log("Registration might have failed (or user exists), trying login...");
        }

        // 2. Login
        console.log("Logging in...");
        const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
            identifier: email,
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log("Got Token.");

        // 3. Create Dummy PDF
        fs.writeFileSync('dummy_resume.pdf', 'Dummy PDF Content');

        // 4. Upload Profile
        const form = new FormData();
        form.append('fullName', 'Test User');
        form.append('course', 'CS');
        form.append('department', 'Engineering');
        form.append('dreamCompany', 'Google');
        form.append('resume', fs.createReadStream('dummy_resume.pdf'));

        console.log("Uploading Profile...");
        const res = await axios.post(`${API_URL}/api/profile`, form, {
            headers: {
                Authorization: `Bearer ${token}`,
                ...form.getHeaders()
            }
        });

        console.log("Success:", res.data);

    } catch (error) {
        console.error("❌ Request Failed:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        }
    }
}

reproduce();
