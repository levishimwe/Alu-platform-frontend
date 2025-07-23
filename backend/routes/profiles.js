const express = require('express');
const router = express.Router();
const { User, GraduateProfile, InvestorProfile } = require('../models');
const auth = require('../middleware/auth');

// GET graduate profile
router.get('/graduate/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First get the user
    const user = await User.findOne({
      where: { 
        id: id,
        userType: 'graduate'
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Graduate not found' });
    }

    // Then get the graduate profile
    const graduateProfile = await GraduateProfile.findOne({
      where: { userId: id }
    });

    // Combine user and profile data, matching your frontend field names
    const profileData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      bio: user.bio || '',
      profileImage: user.profileImage || '',
      university: user.university || '', // From Users table
      graduationYear: graduateProfile?.graduationYear || user.graduationYear || '',
      major: graduateProfile?.major || '',
      skills: graduateProfile?.skills || [],
      achievements: graduateProfile?.achievements || [],
      portfolio_url: graduateProfile?.portfolioUrl || '',
      linkedin_url: graduateProfile?.linkedinUrl || '',
      github_url: graduateProfile?.githubUrl || ''
    };

    res.json(profileData);
  } catch (error) {
    console.error('Error fetching graduate profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// PUT update graduate profile
router.put('/graduate', auth, async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user.id;
    const {
      firstName,
      lastName,
      
      bio,
      university,
      graduationYear,
      major,
      skills,
      achievements,
      portfolio_url,
      linkedin_url,
      github_url
    } = req.body;

    console.log('Updating profile for user:', userId);
    console.log('User object:', req.user);
    console.log('Request body:', req.body);

    // Validation for African Leadership University only
    if (university && university.toLowerCase() !== 'african leadership university') {
      return res.status(400).json({ 
        message: 'Only African Leadership University is accepted' 
      });
    }

    // Validation for accepted majors only
    const acceptedMajors = [
      'BSE (Software Engineering)',
      'BEL (Entrepreneurial Leadership)',
      'IBT (International Business Trade)'
    ];

    if (major && !acceptedMajors.includes(major)) {
      return res.status(400).json({ 
        message: 'Only BSE (Software Engineering), BEL (Entrepreneurial Leadership), and IBT (International Business Trade) majors are accepted' 
      });
    }

    // First, find the user
    const user = await User.findOne({
      where: { 
        id: userId,
        userType: 'graduate'
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Graduate not found' });
    }

    // Update user table (basic info)
    await User.update(
      {
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        bio: bio || user.bio,
        university: university || user.university,
        graduationYear: graduationYear || user.graduationYear
      },
      {
        where: { id: userId }
      }
    );

    // Find or create graduate profile
    const [graduateProfile, created] = await GraduateProfile.findOrCreate({
      where: { userId },
      defaults: {
        userId,
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        email: user.email,
        bio: bio || user.bio,
        graduationYear: graduationYear || user.graduationYear,
        major: major || '',
        skills: skills || [],
        achievements: achievements || [],
        portfolioUrl: portfolio_url || '',
        linkedinUrl: linkedin_url || '',
        githubUrl: github_url || ''
      }
    });

    if (!created) {
      // Update existing profile
      await GraduateProfile.update(
        {
          firstName: firstName || graduateProfile.firstName,
          lastName: lastName || graduateProfile.lastName,
          bio: bio || graduateProfile.bio,
          graduationYear: graduationYear || graduateProfile.graduationYear,
          major: major || graduateProfile.major,
          skills: skills || graduateProfile.skills,
          achievements: achievements || graduateProfile.achievements,
          portfolioUrl: portfolio_url || graduateProfile.portfolioUrl,
          linkedinUrl: linkedin_url || graduateProfile.linkedinUrl,
          githubUrl: github_url || graduateProfile.githubUrl
        },
        {
          where: { userId }
        }
      );
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating graduate profile:', error);
    res.status(500).json({ 
      message: 'Error updating profile', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;