const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interviewer';

console.log(`Testing connection to: ${mongoURI}`);

mongoose.connect(mongoURI)
    .then(() => {
        console.log('MongoDB Connection Successful!');
        process.exit(0);
    })
    .catch(err => {
        console.error('MongoDB Connection Failed:', err);
        process.exit(1);
    });
