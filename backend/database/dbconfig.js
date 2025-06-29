const mongoose = require('mongoose');
function database () {
    const mongoURL =  process.env.MONGO_URL || 'mongodb+srv://kcteja62892:Teja%402004@cluster0.plavaod.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    mongoose.connect(mongoURL)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
}
module.exports = database;