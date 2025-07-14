const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const upload = require('../middleware/upload');
const router = express.Router();

// Register with file upload
router.post('/register', upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'degree', maxCount: 1 }
]), async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      userType, 
      country, 
      city,
      companyName,
      companyWebsite
    } = req.body;

    console.log('Registration request body:', { ...req.body, password: '[HIDDEN]' });
    console.log('Files received:', req.files);

    // Validation
    if (!firstName || !lastName || !email || !password || !userType) {
      return res.status(400).json({ 
        message: 'Required fields are missing',
        required: ['firstName', 'lastName', 'email', 'password', 'userType']
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Handle file uploads
    let profileImagePath = null;
    let degreePath = null;

    if (req.files) {
      if (req.files.profileImage && req.files.profileImage[0]) {
        profileImagePath = `/uploads/profiles/${req.files.profileImage[0].filename}`;
      }
      if (req.files.degree && req.files.degree[0]) {
        degreePath = `/uploads/documents/${req.files.degree[0].filename}`;
      }
    }

    // Create user data
    const userData = {
      userType,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      country: country || 'Rwanda',
      city: city || 'Kigali',
      profileImage: profileImagePath
    };

    // Add user-type specific fields
    if (userType === 'graduate') {
      userData.degree = degreePath;
    } else if (userType === 'investor') {
      userData.companyName = companyName;
      userData.companyWebsite = companyWebsite;
    }

    console.log('Creating user with data:', { ...userData, password: '[HIDDEN]' });

    // Create user
    const user = await User.create(userData);

    res.status(201).json({
      message: 'User created successfully',
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        country: user.country,
        city: user.city,
        profileImage: user.profileImage,
        ...(userType === 'graduate' && { degree: user.degree }),
        ...(userType === 'investor' && { 
          companyName: user.companyName,
          companyWebsite: user.companyWebsite 
        })
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Login (no changes needed)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for:', user.email, 'Type:', user.userType);

    res.json({
      message: 'Login successful',
      success: true,
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        country: user.country,
        city: user.city,
        profileImage: user.profileImage,
        ...(user.userType === 'graduate' && { degree: user.degree }),
        ...(user.userType === 'investor' && { 
          companyName: user.companyName,
          companyWebsite: user.companyWebsite 
        })
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;
