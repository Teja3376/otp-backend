const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbconfig');

const Otp = sequelize.define('Otp', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    otp: { type: DataTypes.STRING, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false }, // <-- changed here
});

module.exports = Otp;