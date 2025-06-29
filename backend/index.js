const express = require('express');
const nodemailer = require('nodemailer'); 
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = require('./database/dbconfig');
dbConfig(); // <-- Connect to MongoDB


const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  }, 
});

const otpSchema = new mongoose.Schema({
  name: String,
  email: String,
  otp: String,
  expiresAt: Number,
});
const Otp = mongoose.model('Otp', otpSchema);

app.post('/send-otp', async (req, res) => {
  const { email, name } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;
  const hashedOtp = await bcrypt.hash(otp, 10);

  try {
    const savedOtp = await Otp.findOneAndUpdate(
      { email },
      { name, otp: hashedOtp, expiresAt },
      { upsert: true, new: true }
    );
    console.log('Saved OTP:', savedOtp);

    await transporter.sendMail({
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    });
    res.json({ message: 'OTP sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const record = await Otp.findOne({ email });
  if (!record || Date.now() > record.expiresAt) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }
  const isMatch = await bcrypt.compare(otp, record.otp);
  if (!isMatch) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }
  // await Otp.deleteOne({ email }); // Do not remove OTP after verification
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  console.log(token);
  
  res.json({ token });
});

app.get('/protected', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    res.json({ message: `Hello ${decoded.email}, you are authenticated.` });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.get('/get-name', async (req, res) => {
  const { email } = req.query;
  try {
    const record = await Otp.findOne({ email });
    if (!record) return res.status(404).json({ error: 'User not found' });
    res.json({ name: record.name });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch name' });
  }
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
