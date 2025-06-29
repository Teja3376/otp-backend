const mongoose = require('mongoose');

async function connectDB() {
    const mongoURL = process.env.MONGO_URL || 'mongodb+srv://kcteja62892:Teja%402004@cluster0.plavaod.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    if (!mongoURL) {
        console.error('MongoDB connection string is missing!');
        process.exit(1);
    }
    try {
        await mongoose.connect(mongoURL);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
}

module.exports = connectDB;