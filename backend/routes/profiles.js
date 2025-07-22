const express = require('express');
const router = express.Router();
const { User, GraduateProfile, InvestorProfile } = require('../models');
const auth = require('../middleware/auth');

// Get graduate profile
router.get('/graduate/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists and is a graduate
    const user = await User.findOne({
      where: { 
        id: userId,
        userType: 'graduate'
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Graduate not found' });
    }

    // Get or create graduate profile
    let profile = await GraduateProfile.findOne({
      where: { userId }
    });

    if (!profile) {
      // Create default profile if doesn't exist
      profile = await GraduateProfile.create({
        userId,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        skills: [],
        experience: [],
        achievements: []
      });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Error fetching graduate profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update graduate profile
router.put('/graduate', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'graduate') {
      return res.status(403).json({ error: 'Access denied. Graduate access required.' });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      location,
      bio,
      graduationYear,
      major,
      skills,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      experience,
      achievements
    } = req.body;

    // Update or create graduate profile
    let profile = await GraduateProfile.findOne({
      where: { userId: req.user.id }
    });

    const profileData = {
      userId: req.user.id,
      firstName,
      lastName,
      email,
      phone,
      location,
      bio,
      graduationYear: graduationYear ? parseInt(graduationYear) : null,
      major,
      skills: Array.isArray(skills) ? skills : [],
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      experience: Array.isArray(experience) ? experience : [],
      achievements: Array.isArray(achievements) ? achievements : []
    };

    if (profile) {
      await profile.update(profileData);
    } else {
      profile = await GraduateProfile.create(profileData);
    }

    // Also update basic user info
    await User.update(
      { firstName, lastName, email },
      { where: { id: req.user.id } }
    );

    res.json({ profile });
  } catch (error) {
    console.error('Error updating graduate profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get investor profile
router.get('/investor/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists and is an investor
    const user = await User.findOne({
      where: { 
        id: userId,
        userType: 'investor'
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    // Get or create investor profile
    let profile = await InvestorProfile.findOne({
      where: { userId }
    });

    if (!profile) {
      // Create default profile if doesn't exist
      profile = await InvestorProfile.create({
        userId,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        industryFocus: [],
        investmentStage: [],
        portfolio: [],
        areasOfInterest: []
      });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Error fetching investor profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update investor profile
router.put('/investor', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'investor') {
      return res.status(403).json({ error: 'Access denied. Investor access required.' });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      location,
      bio,
      company,
      position,
      companySize,
      industryFocus,
      investmentRange,
      investmentStage,
      linkedinUrl,
      websiteUrl,
      investmentCriteria,
      portfolio,
      areasOfInterest
    } = req.body;

    // Update or create investor profile
    let profile = await InvestorProfile.findOne({
      where: { userId: req.user.id }
    });

    const profileData = {
      userId: req.user.id,
      firstName,
      lastName,
      email,
      phone,
      location,
      bio,
      company,
      position,
      companySize,
      industryFocus: Array.isArray(industryFocus) ? industryFocus : [],
      investmentRange,
      investmentStage: Array.isArray(investmentStage) ? investmentStage : [],
      linkedinUrl,
      websiteUrl,
      investmentCriteria,
      portfolio: Array.isArray(portfolio) ? portfolio : [],
      areasOfInterest: Array.isArray(areasOfInterest) ? areasOfInterest : []
    };

    if (profile) {
      await profile.update(profileData);
    } else {
      profile = await InvestorProfile.create(profileData);
    }

    // Also update basic user info
    await User.update(
      { firstName, lastName, email },
      { where: { id: req.user.id } }
    );

    res.json({ profile });
  } catch (error) {
    console.error('Error updating investor profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get public profile (for viewing other users)
router.get('/public/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'firstName', 'lastName', 'userType', 'email']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let profile = null;

    if (user.userType === 'graduate') {
      profile = await GraduateProfile.findOne({
        where: { userId },
        attributes: { exclude: ['email', 'phone'] } // Hide private info
      });
    } else if (user.userType === 'investor') {
      profile = await InvestorProfile.findOne({
        where: { userId },
        attributes: { exclude: ['email', 'phone'] } // Hide private info
      });
    }

    res.json({ 
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType
      },
      profile 
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Search users for messaging
router.get('/search', auth, async (req, res) => {
  try {
    const { term, userType } = req.query;
    
    let whereClause = {
      id: { [require('sequelize').Op.ne]: req.user.id } // Exclude current user
    };

    // Add search term filter
    if (term) {
      const { Op } = require('sequelize');
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${term}%` } },
        { lastName: { [Op.iLike]: `%${term}%` } },
        { email: { [Op.iLike]: `%${term}%` } }
      ];
    }

    // Add user type filter
    if (userType && ['graduate', 'investor'].includes(userType)) {
      whereClause.userType = userType;
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'firstName', 'lastName', 'email', 'userType'],
      limit: 20,
      order: [['firstName', 'ASC']]
    });

    // Get additional profile info for each user
    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        let profileInfo = {};
        
        if (user.userType === 'graduate') {
          const graduateProfile = await GraduateProfile.findOne({
            where: { userId: user.id },
            attributes: ['major', 'graduationYear', 'location']
          });
          if (graduateProfile) {
            profileInfo = {
              major: graduateProfile.major,
              graduationYear: graduateProfile.graduationYear,
              location: graduateProfile.location
            };
          }
        } else if (user.userType === 'investor') {
          const investorProfile = await InvestorProfile.findOne({
            where: { userId: user.id },
            attributes: ['company', 'position', 'location']
          });
          if (investorProfile) {
            profileInfo = {
              company: investorProfile.company,
              position: investorProfile.position,
              location: investorProfile.location
            };
          }
        }

        return {
          ...user.toJSON(),
          ...profileInfo
        };
      })
    );

    res.json({ users: usersWithProfiles });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

module.exports = router;