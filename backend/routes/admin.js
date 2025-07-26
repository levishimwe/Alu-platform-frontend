const express = require('express');
const auth = require('../middleware/auth');
const { User, Project } = require('../models');
const { sequelize } = require('../config/database');
const router = express.Router();

// Admin middleware to check if user is admin
const adminAuth = (req, res, next) => {
  console.log('🔍 Admin auth check - user:', req.user);
  
  if (!req.user) {
    console.log('❌ No user in request');
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  if (req.user.userType !== 'admin') {
    console.log('❌ User is not admin:', req.user.userType);
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  console.log('✅ Admin access granted');
  next();
};

// GET ALL USERS (Admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    console.log('📊 Admin fetching all users');
    
    const users = await sequelize.query(`
      SELECT id, firstName, lastName, email, userType, 
             profileImage, bio, skills, university, graduationYear,
             companyName, companyWebsite, country, city, 
             isActive, lastLogin, createdAt, updatedAt
      FROM Users
      ORDER BY createdAt DESC
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      users,
      total: users.length
    });
  } catch (error) {
    console.error('❌ Admin get users error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      message: error.message 
    });
  }
});

// GET ALL PROJECTS (Admin only)
router.get('/projects', auth, adminAuth, async (req, res) => {
  try {
    console.log('📊 Admin fetching all projects');
    
    const projects = await sequelize.query(`
      SELECT p.id, p.graduateId, p.title, p.description, p.category, p.impactArea,
             p.technologies, p.images, p.videos, p.documents, p.status, 
             p.fundingGoal, p.currentFunding, p.demoUrl, p.repoUrl, p.featured,
             p.createdAt, p.updatedAt,
             u.firstName, u.lastName, u.email
      FROM Projects p
      LEFT JOIN Users u ON p.graduateId = u.id
      ORDER BY p.createdAt DESC
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    // Parse JSON fields
    const processedProjects = projects.map(project => {
      const processed = { ...project };
      
      ['technologies', 'images', 'videos', 'documents'].forEach(field => {
        if (project[field] && typeof project[field] === 'string') {
          try {
            processed[field] = JSON.parse(project[field]);
          } catch (e) {
            processed[field] = [];
          }
        } else if (!project[field]) {
          processed[field] = [];
        }
      });
      
      return processed;
    });

    res.json({
      projects: processedProjects,
      total: processedProjects.length
    });
  } catch (error) {
    console.error('❌ Admin get projects error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch projects',
      message: error.message 
    });
  }
});

// UPDATE USER STATUS (Admin only)
router.put('/users/:id/status', auth, adminAuth, async (req, res) => {
  try {
    
    const { isActive } = req.body;
    
    await sequelize.query(`
      UPDATE Users 
      SET isActive = ?, updatedAt = NOW() 
      WHERE id = ?
    `, {
      replacements: [isActive, req.params.id],
      type: sequelize.QueryTypes.UPDATE
    });

    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('❌ Admin update user status error:', error);
    res.status(500).json({ 
      error: 'Failed to update user status',
      message: error.message 
    });
  }
});

// UPDATE PROJECT STATUS (Admin only)
router.put('/projects/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status, featured } = req.body;
    
    const updateFields = [];
    const updateValues = [];
    
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    
    if (featured !== undefined) {
      updateFields.push('featured = ?');
      updateValues.push(featured);
    }
    
    if (updateFields.length > 0) {
      updateValues.push(req.params.id);
      
      await sequelize.query(`
        UPDATE Projects 
        SET ${updateFields.join(', ')}, updatedAt = NOW() 
        WHERE id = ?
      `, {
        replacements: updateValues,
        type: sequelize.QueryTypes.UPDATE
      });
    }

    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('❌ Admin update project error:', error);
    res.status(500).json({ 
      error: 'Failed to update project',
      message: error.message 
    });
  }
});

// DELETE USER (Admin only)
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    await sequelize.query('DELETE FROM Users WHERE id = ?', {
      replacements: [req.params.id],
      type: sequelize.QueryTypes.DELETE
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Admin delete user error:', error);
    res.status(500).json({ 
      error: 'Failed to delete user',
      message: error.message 
    });
  }
});

// DELETE PROJECT (Admin only)
router.delete('/projects/:id', auth, adminAuth, async (req, res) => {
  try {
    await sequelize.query('DELETE FROM Projects WHERE id = ?', {
      replacements: [req.params.id],
      type: sequelize.QueryTypes.DELETE
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('❌ Admin delete project error:', error);
    res.status(500).json({ 
      error: 'Failed to delete project',
      message: error.message 
    });
  }
});

module.exports = router;
