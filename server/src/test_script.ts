console.log("Starting test script...");
try {
    const connectDB = require('./config/db').default;
    console.log("Imported connectDB. Type:", typeof connectDB);
    console.log("Value:", connectDB);
    if (typeof connectDB !== 'function') {
        throw new Error('connectDB is not a function');
    }
    connectDB().then(() => {
        console.log("Database connection routine finished.");
    }).catch((err: any) => {
        console.error("Database connection failed:", err);
    });

    console.log("Testing other imports...");
    try {
        require('./models/User');
        console.log("Imported User model");
        require('./routes/auth');
        console.log("Imported Auth routes");
        require('./socket/index');
        console.log("Imported Socket index");
        require('./routes/profile');
        console.log("Imported Profile routes");
        require('./routes/reportRoutes');
        console.log("Imported Report routes");

        const express = require('express');
        const cors = require('cors');
        const app = express();
        app.use(cors());
        console.log("Express app created");
    } catch (e) {
        console.error("Import error:", e);
    }
} catch (error) {
    console.error("Import failed:", error);
}
