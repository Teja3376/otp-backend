const Otp = require('../models/otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Check for required environment variables
if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL and EMAIL_PASS must be set in .env');
}
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in .env');
}

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});

exports.sendOtp = async (req, res) => {
    const { email, name } = req.body;
    if (!email || !name) {
        return res.status(400).json({ error: 'Email and name are required' });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    const hashedOtp = await bcrypt.hash(otp, 10);

    try {
        await Otp.findOneAndUpdate(
            { email },
            { name, otp: hashedOtp, expiresAt },
            { upsert: true, new: true }
        );

        await transporter.sendMail({
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP is ${otp}. It expires in 5 minutes.`,
        });
        res.json({ message: 'OTP sent' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send OTP' }); // removed details
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }
        const record = await Otp.findOne({ email });
        if (!record || Date.now() > record.expiresAt) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }
        const isMatch = await bcrypt.compare(otp, record.otp);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Server error' }); // removed details
    }
};

exports.getName = async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    try {
        const record = await Otp.findOne({ email });
        if (!record) return res.status(404).json({ error: 'User not found' });
        res.json({ name: record.name });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch name' }); // removed details
    }
};

exports.protected = (req, res) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const parts = auth.split(' ');
    if (parts.length !== 2) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const token = parts[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ message: `Hello ${decoded.email}, you are authenticated.` });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};