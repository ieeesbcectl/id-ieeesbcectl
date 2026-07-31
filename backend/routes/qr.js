const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/qr/:id
// @desc    Generate & return QR code PNG
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const memberId = req.params.id;
    // URL that the QR code will point to
    // We assume the frontend is hosted at the domain setup in our roadmap
    const frontendUrl = process.env.FRONTEND_URL || 'https://id.ieeesbcectl.in';
    const profileUrl = `${frontendUrl}/profile/${memberId}`;

    // Generate QR code as a PNG buffer
    const qrBuffer = await QRCode.toBuffer(profileUrl, {
      type: 'png',
      margin: 1,
      width: 400,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // Send back the image
    res.type('image/png');
    res.send(qrBuffer);
  } catch (error) {
    console.error('Error generating QR Code:', error);
    res.status(500).json({ message: 'Failed to generate QR code' });
  }
});

module.exports = router;
