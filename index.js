const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const authRoutes = require('./routes/authRoutes.js');
const movieRoutes = require('./routes/moviesRoutes.js');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

dotenv.config();
connectDB();
const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`Server running on port ${PORT}`)
);
