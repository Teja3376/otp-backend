const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'emailotpverify',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || 'root',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false,
    }
);

async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('MySQL connected');
    } catch (err) {
        console.error('MySQL connection error:', err.message);
        process.exit(1);
    }
}

module.exports = { sequelize, connectDB };