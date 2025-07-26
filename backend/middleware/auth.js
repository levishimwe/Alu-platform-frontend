const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('Decoded token:', decoded);

    // Use userId from token (since that's what your JWT contains)
    const userId = decoded.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Invalid token - no userId found' });
    }

    const user = await User.findByPk(userId);
    
    if (!user) {
      console.log('User not found for ID:', userId);
      return res.status(401).json({ message: 'User not found' });
    }

    // ✅ FIX: Add userId field for compatibility with projects route
    req.user = {
      id: user.id,
      userId: user.id,        // Add this line
      email: user.email,
      userType: user.userType
    };

    console.log('Auth middleware - user set:', req.user);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;