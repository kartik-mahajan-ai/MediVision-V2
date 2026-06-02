const mongoose = require('mongoose');

const connectDB = async (retryCount = 5) => {
    try {
        console.log('Connecting to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        if (retryCount > 0) {
            console.log(`Retrying connection... (${retryCount} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            return connectDB(retryCount - 1);
        }
        console.error('Failed to connect to MongoDB after multiple attempts.');
        // Don't exit process here during debugging to allow health checks
        // process.exit(1);
    }
};

module.exports = connectDB;
