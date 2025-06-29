const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB, sequelize } = require('./config/dbconfig');
const Otp = require('./models/otp');

const app = express();

app.use(cors());

app.use(express.json());

const otpRoutes = require('./routes/otpRoutes');
app.use('/', otpRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    sequelize.sync().then(() => {
        app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    });
});
