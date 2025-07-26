const express = require('express');
const router = express.Router();
const { User, GraduateProfile, InvestorProfile } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// GET all users (for ContactModal)
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching all users for user:', req.user.userId);
    
    const users = await User.findAll({
      where: {
        id: { [Op.ne]: req.user.userId }, // Exclude current user
        isActive: true
      },
      attributes: [
        'id', 'firstName', 'lastName', 'email', 'userType', 'profileImage', 
        'bio', 'university', 'graduationYear', 'companyName', 'companyWebsite', 
        'country', 'city', 'createdAt'
      ],
      order: [['firstName', 'ASC'], ['lastName', 'ASC']],
      limit: 100
    });

    // Get additional profile information for each user
    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        let additionalInfo = {};
        
        if (user.userType === 'graduate') {
          try {
            const graduateProfile = await GraduateProfile.findOne({
              where: { userId: user.id },
              attributes: ['major', 'skills', 'linkedinUrl', 'githubUrl', 'portfolioUrl']
            });
            
            additionalInfo = {
              major: graduateProfile?.major || '',
              skills: graduateProfile?.skills || '',
              linkedinUrl: graduateProfile?.linkedinUrl || '',
              githubUrl: graduateProfile?.githubUrl || '',
              portfolioUrl: graduateProfile?.portfolioUrl || ''
            };
          } catch (profileError) {
            console.error('Error fetching graduate profile for user', user.id, ':', profileError);
            additionalInfo = {
              major: '',
              skills: '',
              linkedinUrl: '',
              githubUrl: '',
              portfolioUrl: ''
            };
          }
        } else if (user.userType === 'investor') {
          try {
            const investorProfile = await InvestorProfile.findOne({
              where: { userId: user.id },
              attributes: ['company', 'position', 'investment_focus', 'investment_range', 'linkedinUrl', 'companyWebsite']
            });
            
            additionalInfo = {
              company: investorProfile?.company || user.companyName || '',
              position: investorProfile?.position || '',
              investment_focus: investorProfile?.investment_focus || '',
              investment_range: investorProfile?.investment_range || '',
              linkedinUrl: investorProfile?.linkedinUrl || '',
              companyWebsite: investorProfile?.companyWebsite || user.companyWebsite || ''
            };
          } catch (profileError) {
            console.error('Error fetching investor profile for user', user.id, ':', profileError);
            additionalInfo = {
              company: user.companyName || '',
              position: '',
              investment_focus: '',
              investment_range: '',
              linkedinUrl: '',
              companyWebsite: user.companyWebsite || ''
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
          bio: user.bio,
          university: user.university,
          graduationYear: user.graduationYear,
          companyName: user.companyName,
          country: user.country,
          city: user.city,
          createdAt: user.createdAt,
          ...additionalInfo
        };
      })
    );

    console.log(`Found ${usersWithProfiles.length} users`);
    res.json({ 
      users: usersWithProfiles,
      total: usersWithProfiles.length 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      message: error.message 
    });
  }
});

// GET search users with autocomplete
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user.userId;
    
    console.log(`Searching users with query: "${q}" for user:`, currentUserId);
    
    if (!q || q.length < 1) {
      return res.json({ users: [] });
    }
    
    // Use case-insensitive search for better results
    const users = await User.findAll({
      where: {
        id: { [Op.ne]: currentUserId },
        [Op.or]: [
          { firstName: { [Op.like]: `%${q}%` } }, // Changed to include middle matches
          { lastName: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } }
        ],
        isActive: true
      },
      attributes: [
        'id', 'firstName', 'lastName', 'email', 'userType', 'profileImage', 
        'university', 'graduationYear', 'bio', 'companyName', 'country', 'city'
      ],
      limit: 10,
      order: [
        ['firstName', 'ASC'],
        ['lastName', 'ASC']
      ]
    });

    // Get additional profile information for each user
    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        let additionalInfo = {};
        
        if (user.userType === 'graduate') {
          try {
            const graduateProfile = await GraduateProfile.findOne({
              where: { userId: user.id },
              attributes: ['major', 'skills', 'linkedinUrl', 'githubUrl', 'portfolioUrl']
            });
            
            additionalInfo = {
              major: graduateProfile?.major || '',
              skills: graduateProfile?.skills || '',
              university: user.university || '',
              graduationYear: user.graduationYear || '',
              linkedinUrl: graduateProfile?.linkedinUrl || '',
              githubUrl: graduateProfile?.githubUrl || '',
              portfolioUrl: graduateProfile?.portfolioUrl || ''
            };
          } catch (profileError) {
            console.error('Error fetching graduate profile for user', user.id, ':', profileError);
            additionalInfo = {
              major: '',
              skills: '',
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
              attributes: ['company', 'position', 'investment_focus', 'investment_range', 'linkedinUrl', 'companyWebsite']
            });
            
            additionalInfo = {
              company: investorProfile?.company || user.companyName || '',
              position: investorProfile?.position || '',
              investment_focus: investorProfile?.investment_focus || '',
              investment_range: investorProfile?.investment_range || '',
              linkedinUrl: investorProfile?.linkedinUrl || '',
              companyWebsite: investorProfile?.companyWebsite || ''
            };
          } catch (profileError) {
            console.error('Error fetching investor profile for user', user.id, ':', profileError);
            additionalInfo = {
              company: user.companyName || '',
              position: '',
              investment_focus: '',
              investment_range: '',
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
          bio: user.bio,
          country: user.country,
          city: user.city,
          ...additionalInfo
        };
      })
    );

    console.log(`Found ${usersWithProfiles.length} users matching "${q}"`);
    res.json({ 
      users: usersWithProfiles,
      total: usersWithProfiles.length 
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ 
      error: 'Failed to search users',
      message: error.message 
    });
  }
});

// GET user profile by ID (for viewing other users' profiles)
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Fetching profile for user ID: ${id}`);
    
    const user = await User.findOne({
      where: { id, isActive: true },
      attributes: [
        'id', 'firstName', 'lastName', 'email', 'userType', 'profileImage', 
        'bio', 'university', 'graduationYear', 'companyName', 'companyWebsite', 
        'country', 'city', 'createdAt'
      ]
    });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'The requested user profile does not exist or is inactive' 
      });
    }
    
    let profileData = { ...user.toJSON() };
    
    // Get additional profile data based on user type
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
    
    console.log(`Successfully fetched profile for user: ${profileData.firstName} ${profileData.lastName}`);
    res.json(profileData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user profile',
      message: error.message 
    });
  }
});

module.exports = router;