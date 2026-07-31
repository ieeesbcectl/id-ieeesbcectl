const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');

// Helper to upload buffer to cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const cld_upload_stream = cloudinary.uploader.upload_stream(
      {
        folder: 'ieeesb-members',
        format: 'avif', // Force AVIF format as requested
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(cld_upload_stream);
  });
};

// @route   GET /api/members
// @desc    Get all members
// @access  Private
router.get('/', authMiddleware, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM members');
    const members = stmt.all();
    
    // Parse socials JSON string back to object for response
    const formattedMembers = members.map(member => ({
      ...member,
      socials: member.socials ? JSON.parse(member.socials) : {}
    }));
    
    res.json(formattedMembers);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/members/:id
// @desc    Get single member (public profile)
// @access  Public
router.get('/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM members WHERE id = ?');
    const member = stmt.get(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    member.socials = member.socials ? JSON.parse(member.socials) : {};
    res.json(member);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/members
// @desc    Add new member with photo
// @access  Private
router.post('/', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const { name, position, department, batch, socials } = req.body;
    let photoUrl = null;
    let cloudinary_public_id = null;

    // Handle Image Upload
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        photoUrl = result.secure_url;
        cloudinary_public_id = result.public_id;
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        return res.status(500).json({ message: "Image upload failed" });
      }
    }

    const id = uuidv4();
    const socialsString = socials ? (typeof socials === 'string' ? socials : JSON.stringify(socials)) : '{}';

    const stmt = db.prepare(`
      INSERT INTO members (id, name, photo, cloudinary_public_id, position, department, batch, socials)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, name, photoUrl, cloudinary_public_id, position, department, batch, socialsString);

    const newMember = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
    newMember.socials = JSON.parse(newMember.socials);
    
    res.json(newMember);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/members/:id
// @desc    Update member details and optionally photo
// @access  Private
router.put('/:id', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const { name, position, department, batch, socials } = req.body;
    const id = req.params.id;

    // Check if member exists
    const checkStmt = db.prepare('SELECT * FROM members WHERE id = ?');
    const existingMember = checkStmt.get(id);

    if (!existingMember) {
      return res.status(404).json({ message: 'Member not found' });
    }

    let photoUrl = existingMember.photo;
    let cloudinary_public_id = existingMember.cloudinary_public_id;

    // If new file uploaded, upload to cloudinary and delete old one
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        photoUrl = result.secure_url;
        
        // Delete old image from cloudinary if it exists
        if (existingMember.cloudinary_public_id) {
          await cloudinary.uploader.destroy(existingMember.cloudinary_public_id);
        }
        
        cloudinary_public_id = result.public_id;
      } catch (uploadError) {
        console.error("Cloudinary upload/destroy failed:", uploadError);
        return res.status(500).json({ message: "Image update failed" });
      }
    }

    const socialsString = socials ? (typeof socials === 'string' ? socials : JSON.stringify(socials)) : existingMember.socials;
    
    const updateName = name !== undefined ? name : existingMember.name;
    const updatePosition = position !== undefined ? position : existingMember.position;
    const updateDepartment = department !== undefined ? department : existingMember.department;
    const updateBatch = batch !== undefined ? batch : existingMember.batch;

    const stmt = db.prepare(`
      UPDATE members 
      SET name = ?, photo = ?, cloudinary_public_id = ?, position = ?, department = ?, batch = ?, socials = ?
      WHERE id = ?
    `);
    
    stmt.run(updateName, photoUrl, cloudinary_public_id, updatePosition, updateDepartment, updateBatch, socialsString, id);

    const updatedMember = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
    updatedMember.socials = JSON.parse(updatedMember.socials);
    
    res.json(updatedMember);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/members/:id
// @desc    Delete member and auto-delete Cloudinary photo
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;

    // Check if member exists
    const checkStmt = db.prepare('SELECT * FROM members WHERE id = ?');
    const existingMember = checkStmt.get(id);

    if (!existingMember) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Phase 3: Auto-delete Cloudinary Image
    if (existingMember.cloudinary_public_id) {
      try {
        await cloudinary.uploader.destroy(existingMember.cloudinary_public_id);
      } catch (cloudinaryError) {
        console.error("Failed to delete image from Cloudinary:", cloudinaryError);
        // Continue with deleting the DB record even if cloudinary fails 
        // to prevent zombie records
      }
    }

    const stmt = db.prepare('DELETE FROM members WHERE id = ?');
    stmt.run(id);

    res.json({ message: 'Member and associated photo removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
