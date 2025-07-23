const express = require('express');
const router = express.Router();
const { User, GraduateProfile, InvestorProfile } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// GET search users with autocomplete
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query; // search query
    const currentUserId = req.user.id;
    
    if (!q || q.length < 1) {
      return res.json({ users: [] });
    }
    
    // Search users by firstName, lastName, or email
    // Exclude current user from results
    const users = await User.findAll({
      where: {
        id: { [Op.ne]: currentUserId }, // Exclude current user
        [Op.or]: [
          { firstName: { [Op.like]: `${q}%` } },
          { lastName: { [Op.like]: `${q}%` } },
          { email: { [Op.like]: `${q}%` } }
        ],
        isActive: true
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'userType', 'profileImage', 'university', 'graduationYear'], // Added university and graduationYear from Users table
      limit: 10, // Limit results for performance
      order: [['firstName', 'ASC']]
    });

    // Get additional profile information for each user
    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        let additionalInfo = {};
        
        if (user.userType === 'graduate') {
          try {
            const graduateProfile = await GraduateProfile.findOne({
              where: { userId: user.id },
              attributes: ['major', 'linkedinUrl', 'githubUrl', 'portfolioUrl'] // Removed university and graduationYear since they're in Users table
            });
            
            additionalInfo = {
              major: graduateProfile?.major || '',
              university: user.university || '', // Get from Users table
              graduationYear: user.graduationYear || '', // Get from Users table
              linkedinUrl: graduateProfile?.linkedinUrl || '',
              githubUrl: graduateProfile?.githubUrl || '',
              portfolioUrl: graduateProfile?.portfolioUrl || ''
            };
          } catch (profileError) {
            console.error('Error fetching graduate profile for user', user.id, ':', profileError);
            additionalInfo = {
              major: '',
              university: user.university || '',
              graduationYear: user.graduationYear || '',
              linkedinUrl: '',
              githubUrl: '',
              portfolioUrl: ''
            };
          }
        } else if (user.userType === 'investor') {
          try {
            const investorProfile = await InvestorProfile.findOne({
              where: { userId: user.id },
              attributes: ['company', 'position', 'linkedinUrl', 'companyWebsite']
            });
            
            additionalInfo = {
              company: investorProfile?.company || '',
              position: investorProfile?.position || '',
              linkedinUrl: investorProfile?.linkedinUrl || '',
              companyWebsite: investorProfile?.companyWebsite || ''
            };
          } catch (profileError) {
            console.error('Error fetching investor profile for user', user.id, ':', profileError);
            additionalInfo = {
              company: '',
              position: '',
              linkedinUrl: '',
              companyWebsite: ''
            };
          }
        }
        
        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType: user.userType,
          profileImage: user.profileImage,
          ...additionalInfo
        };
      })
    );

    res.json({ users: usersWithProfiles });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Error searching users', error: error.message });
  }
});

// GET user profile by ID (for viewing other users' profiles)
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findOne({
      where: { id, isActive: true },
      attributes: ['id', 'firstName', 'lastName', 'email', 'userType', 'profileImage', 'bio', 'university', 'graduationYear']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let profileData = { ...user.toJSON() };
    
    if (user.userType === 'graduate') {
      try {
        const graduateProfile = await GraduateProfile.findOne({
          where: { userId: id }
        });
        
        if (graduateProfile) {
          profileData = {
            ...profileData,
            major: graduateProfile.major,
            skills: graduateProfile.skills,
            achievements: graduateProfile.achievements,
            linkedinUrl: graduateProfile.linkedinUrl,
            githubUrl: graduateProfile.githubUrl,
            portfolioUrl: graduateProfile.portfolioUrl
          };
        }
      } catch (profileError) {
        console.error('Error fetching graduate profile:', profileError);
      }
    } else if (user.userType === 'investor') {
      try {
        const investorProfile = await InvestorProfile.findOne({
          where: { userId: id }
        });
        
        if (investorProfile) {
          profileData = {
            ...profileData,
            company: investorProfile.company,
            position: investorProfile.position,
            investment_focus: investorProfile.investment_focus,
            investment_range: investorProfile.investment_range,
            linkedinUrl: investorProfile.linkedinUrl,
            companyWebsite: investorProfile.companyWebsite
          };
        }
      } catch (profileError) {
        console.error('Error fetching investor profile:', profileError);
      }
    }
    
    res.json(profileData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

module.exports = router;