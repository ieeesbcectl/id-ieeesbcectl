const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();
const db = require('./db');

const app = express();
// Let Railway assign the PORT, fallback to 3000
const PORT = process.env.PORT || 3000;

// Tell Express it is running behind a proxy (Railway/Cloudflare)
// This is critical for CORS and Rate Limiting to work correctly
app.set('trust proxy', 1);

app.use(express.json());

// Remove ALL complex CORS and use the simplest possible approach
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === process.env.FRONTEND_URL || origin === 'http://localhost:5173') {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Fallback for testing
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Basic Route
app.use('/api/auth', require('./routes/auth'));
app.use('/api/members', require('./routes/members'));
app.use('/api/qr', require('./routes/qr'));

app.get('/', (req, res) => {
  res.send('Hello World');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
