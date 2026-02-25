import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interviewer';

    const attemptConnection = async (attempt: number = 1): Promise<void> => {
        try {
            console.log(`Attempting MongoDB connection... (attempt ${attempt})`);
            const conn = await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 10000,
                connectTimeoutMS: 10000
            });
            console.log(`MongoDB Connected: ${conn.connection.host}`);
        } catch (error) {
            console.error(`MongoDB Connection Error: ${error instanceof Error ? error.message : error}`);
            if (attempt < 5) {
                console.log(`Retrying in 5 seconds... (${attempt}/5)`);
                await new Promise(r => setTimeout(r, 5000));
                return attemptConnection(attempt + 1);
            } else {
                console.error('MongoDB: All 5 connection attempts failed. Server running WITHOUT database.');
                console.error('Start MongoDB and the server will need a restart.');
            }
        }
    };

    await attemptConnection();
};

export default connectDB;
