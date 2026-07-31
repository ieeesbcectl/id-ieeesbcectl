const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// MUST BE FIRST: CORS configuration
app.use(cors({
  origin: '*', // Temporarily allow all origins to isolate the issue
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// MUST BE SECOND: Handle OPTIONS requests explicitly for all routes
app.options('*', cors());

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);
app.use(express.json());

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
