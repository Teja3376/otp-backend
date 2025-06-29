const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    expiresAt: { type: Number, required: true },
});

module.exports = mongoose.model('Otp', otpSchema);