const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/dbconfig');
connectDB();

const app = express();

// Allow only your frontend domain
app.use(cors({
    origin: 'https://otp-frontend-production.up.railway.app',
    credentials: true, // if you use cookies or authentication headers
}));

app.use(express.json());

const otpRoutes = require('./routes/otpRoutes');
app.use('/', otpRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
