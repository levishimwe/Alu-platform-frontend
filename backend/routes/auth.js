// Import necessary modules 
const express = require('express');
const bcrypt = require('bcrypt'); // Add this line
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

// List of countries for validation
const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Angola', 'Argentina', 'Australia', 'Austria',
  'Bangladesh', 'Belgium', 'Botswana', 'Brazil', 'Burkina Faso', 'Burundi',
  'Cameroon', 'Canada', 'Chad', 'China', 'Congo', 'Democratic Republic of Congo',
  'Egypt', 'Ethiopia', 'France', 'Germany', 'Ghana', 'India', 'Kenya', 'Libya',
  'Madagascar', 'Mali', 'Morocco', 'Mozambique', 'Niger', 'Nigeria', 'Rwanda',
  'South Africa', 'Tanzania', 'Tunisia', 'Uganda', 'United Kingdom', 'United States',
  'Zambia', 'Zimbabwe', 'Other'
];

// Validation middleware for Google email
const validateGoogleEmail = (email) => {
  const googleDomains = ['@gmail.com', '@googlemail.com'];
  return googleDomains.some(domain => email.toLowerCase().endsWith(domain));
};

// Register route
router.post('/register', [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
    .custom((email) => {
      if (!validateGoogleEmail(email)) {
        throw new Error('This email is not accepted. Please use a Google email address (@gmail.com or @googlemail.com)');
      }
      return true;
    }),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('userType')
    .isIn(['graduate', 'investor'])
    .withMessage('User type must be either graduate or investor'),
  
  body('profileImage')
    .optional({ nullable: true, checkFalsy: true }) // ✅ Skip validation for empty values
    .custom((url) => {
      if (url && !url.includes('drive.google.com')) {
        throw new Error('Profile image must be a Google Drive link');
      }
      return true;
    }),

  // Graduate-specific validations
  body('degreeCertificate')
    .optional({ nullable: true, checkFalsy: true }) // ✅ Skip validation for empty values
    .custom((url) => {
      if (url && !url.includes('drive.google.com')) {
        throw new Error('Degree certificate must be a Google Drive link');
      }
      return true;
    }),

  body('graduationYear')
    .optional({ nullable: true, checkFalsy: true }) // ✅ Skip validation for empty values
    .isInt({ min: 1950, max: new Date().getFullYear() + 10 })
    .withMessage('Please provide a valid graduation year'),

  // Investor-specific validations
body('companyWebsite')
  .optional({ nullable: true, checkFalsy: true })
  .customSanitizer((value) => {
    // Trim whitespace and add https:// if not present
    if (value && value.trim()) {
      let trimmed = value.trim();
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        trimmed = 'https://' + trimmed;
      }
      return trimmed;
    }
    return value;
  })
  .isURL()
  .withMessage('Please provide a valid company website URL'),

  // Location validations
  body('country')
    .optional({ nullable: true, checkFalsy: true }) // ✅ Skip validation for empty values
    .isIn(countries)
    .withMessage('Please select a valid country'),

  body('city')
    .optional({ nullable: true, checkFalsy: true }) // ✅ Skip validation for empty values
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
    
], async (req, res) => {
  try {
    // Add detailed logging
    console.log('📝 Registration attempt:', {
      body: req.body,
      headers: req.headers['content-type']
    });

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      userType, 
      profileImage, 
      bio,
      university,
      graduationYear,
      degreeCertificate,
      companyName,
      companyWebsite,
      country,
      city
    } = req.body;

    console.log('📋 Extracted fields:', {
      firstName, lastName, email, userType, country, city
    });

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('❌ User already exists with email:', email);
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user with all fields
    const userData = {

      firstName,
      lastName,
      email,
      password,
      userType,
      profileImage,
      bio,
      country,
      city
    };

    // Add graduate-specific fields
    if (userType === 'graduate') {
      if (university) userData.university = university;
      if (graduationYear) userData.graduationYear = graduationYear;
      if (degreeCertificate) userData.degreeCertificate = degreeCertificate;
    }

    // Add investor-specific fields
    if (userType === 'investor') {
      if (companyName) userData.companyName = companyName;
      if (companyWebsite) userData.companyWebsite = companyWebsite;
    }

    console.log('👤 Creating user with data:', userData);


    const user = await User.create(userData);

    console.log('✅ User created successfully:', user.id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        userType: user.userType 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType,
      profileImage: user.profileImage,
      bio: user.bio,
      university: user.university,
      graduationYear: user.graduationYear,
      degreeCertificate: user.degreeCertificate,
      companyName: user.companyName,
      companyWebsite: user.companyWebsite,
      country: user.country,
      city: user.city,
      createdAt: user.createdAt
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('💥 Registration error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      errors: error.errors
    });
    
    if (error.name === 'SequelizeValidationError') {
      console.log('🔍 Sequelize validation errors:', error.errors);
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        }))
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    if (error.name === 'SequelizeDatabaseError') {
      console.log('🔍 Database error:', error.message);
      return res.status(500).json({ error: 'Database error: ' + error.message });
    }

    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

// Login route
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
    .custom((email) => {
      if (!validateGoogleEmail(email)) {
        throw new Error('This email is not accepted. Please use a Google email address (@gmail.com or @googlemail.com)');
      }
      return true;
    }),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account has been deactivated. Please contact support.' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        userType: user.userType 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType,
      profileImage: user.profileImage,
      bio: user.bio,
      university: user.university,
      graduationYear: user.graduationYear,
      degreeCertificate: user.degreeCertificate,
      companyName: user.companyName,
      companyWebsite: user.companyWebsite,
      country: user.country,
      city: user.city,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile retrieved successfully',
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('profileImage')
    .optional()
    .custom((url) => {
      if (url && !url.includes('drive.google.com')) {
        throw new Error('Profile image must be a Google Drive link');
      }
      return true;
    }),

  body('degreeCertificate')
    .optional()
    .custom((url) => {
      if (url && !url.includes('drive.google.com')) {
        throw new Error('Degree certificate must be a Google Drive link');
      }
      return true;
    }),

  body('companyWebsite')
    .optional()
    .isURL()
    .withMessage('Please provide a valid company website URL'),

  body('country')
    .optional()
    .isIn(countries)
    .withMessage('Please select a valid country'),

  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),

  body('graduationYear')
    .optional()
    .isInt({ min: 1950, max: new Date().getFullYear() + 10 })
    .withMessage('Please provide a valid graduation year'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { 
      firstName, 
      lastName, 
      bio, 
      university,
      graduationYear,
      degreeCertificate,
      companyName,
      companyWebsite,
      country,
      city,
      profileImage,
      skills
    } = req.body;

    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    if (university !== undefined) updateData.university = university;
    if (graduationYear !== undefined) updateData.graduationYear = graduationYear;
    if (degreeCertificate !== undefined) updateData.degreeCertificate = degreeCertificate;
    if (companyName !== undefined) updateData.companyName = companyName;
    if (companyWebsite !== undefined) updateData.companyWebsite = companyWebsite;
    if (country !== undefined) updateData.country = country;
    if (city !== undefined) updateData.city = city;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (skills !== undefined) updateData.skills = skills;

    await user.update(updateData);

    const updatedUser = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password'] }
    });

    res.json({ 
      message: 'Profile updated successfully', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', auth, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    await user.update({ password: newPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Logout route (optional - mainly for client-side token clearing)
router.post('/logout', auth, async (req, res) => {
  try {
    // In a JWT implementation, logout is mainly handled client-side
    // But we can update the user's lastLogin or add to a blacklist if needed
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Delete/Deactivate account
router.delete('/account', auth, [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { password } = req.body;

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    // Soft delete - deactivate account instead of deleting
    await user.update({ isActive: false });

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to deactivate account' });
  }
});

// Get all users (admin only)
router.get('/users', auth, async (req, res) => {
  try {
    // Check if user is admin
    const currentUser = await User.findByPk(req.user.userId);
    if (!currentUser || currentUser.userType !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    const { page = 1, limit = 10, userType, isActive } = req.query;
    
    const whereClause = {};
    if (userType) whereClause.userType = userType;
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      message: 'Users retrieved successfully',
      users: users.rows,
      pagination: {
        total: users.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(users.count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// Verify token route
router.get('/verify', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    res.json({
      message: 'Token is valid',
      user
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
});

module.exports = router;
