const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// @route   POST /api/auth/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check against env variables
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (username === adminUsername && password === adminPassword) {
    // Create JWT Payload
    const payload = {
      admin: {
        username: adminUsername,
      },
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
});

module.exports = router;
