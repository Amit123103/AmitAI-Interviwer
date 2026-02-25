const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
}, { strict: false });

const User = mongoose.model('User', UserSchema);

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const adminEmail = 'admin@example.com';
        const adminPassword = 'adminpassword';

        // Check if admin exists
        let admin = await User.findOne({ email: adminEmail });
        if (admin) {
            console.log('Admin already exists');
            // Update role just in case
            admin.role = 'admin';
            await admin.save();
            console.log('Admin role updated');
        } else {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(adminPassword, salt);

            admin = await User.create({
                username: 'admin',
                email: adminEmail,
                passwordHash,
                role: 'admin'
            });
            console.log('Admin created successfully');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createAdmin();
