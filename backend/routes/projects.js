const express = require('express');
const { body, validationResult } = require('express-validator');
const { Project, User } = require('../models');
const { sequelize } = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Validation functions
const validateGoogleDriveLink = (url) => {
  return url && url.includes('drive.google.com');
};

const validateYouTubeLink = (url) => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/;
  return youtubeRegex.test(url);
};

// CREATE PROJECT
router.post('/', auth, [
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
], async (req, res) => {
  try {
    console.log('📝 Raw request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Project validation errors:', errors.array());
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { 
      title, 
      description, 
      category,
      impactArea,
      technologies, 
      fundingGoal, 
      demoUrl, 
      repoUrl,
      imageUrls,
      videoUrls,
      documentUrls
    } = req.body;
    
    const graduateId = req.user.id;

    console.log('🔍 Extracted fields:', { 
      title, description, category, impactArea, graduateId,
      technologies, fundingGoal, demoUrl, repoUrl 
    });
    console.log('📎 URLs received:', { imageUrls, videoUrls, documentUrls });

    // Process URLs - handle both string and array formats
    let images = [];
    let videos = [];
    let documents = [];

    try {
      // Handle imageUrls
      if (imageUrls) {
        if (typeof imageUrls === 'string') {
          images = JSON.parse(imageUrls).filter(url => url?.trim());
        } else if (Array.isArray(imageUrls)) {
          images = imageUrls.filter(url => url?.trim());
        }
      }

      // Handle videoUrls
      if (videoUrls) {
        if (typeof videoUrls === 'string') {
          videos = JSON.parse(videoUrls).filter(url => url?.trim());
        } else if (Array.isArray(videoUrls)) {
          videos = videoUrls.filter(url => url?.trim());
        }
      }

      // Handle documentUrls
      if (documentUrls) {
        if (typeof documentUrls === 'string') {
          documents = JSON.parse(documentUrls).filter(url => url?.trim());
        } else if (Array.isArray(documentUrls)) {
          documents = documentUrls.filter(url => url?.trim());
        }
      }
    } catch (parseError) {
      console.error('❌ Error parsing URLs:', parseError);
      return res.status(400).json({
        error: 'Invalid URL format',
        message: 'Please provide valid URL arrays'
      });
    }

    console.log('✅ Processed URLs:', { images, videos, documents });

    // Validate required fields
    if (!title || !description || !graduateId) {
      console.log('❌ Missing required fields:', { title: !!title, description: !!description, graduateId: !!graduateId });
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Title, description, and graduateId are required'
      });
    }

    // Prepare replacement values
    const replacementValues = [
      title,
      description,
      graduateId,
      category || null,
      impactArea || null,
      JSON.stringify(technologies || []),
      JSON.stringify(images),
      JSON.stringify(videos),
      JSON.stringify(documents),
      'active',
      fundingGoal ? parseFloat(fundingGoal) : null,
      0.00,
      demoUrl || null,
      repoUrl || null,
      false
    ];

    console.log('📊 Replacement values count:', replacementValues.length);
    console.log('📊 Replacement values:', replacementValues);

    // Create project using raw query
    const insertQuery = `
      INSERT INTO Projects (
        title, description, graduateId, category, impactArea,
        technologies, images, videos, documents, status, 
        fundingGoal, currentFunding, demoUrl, repoUrl, featured,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    console.log('🗃️  Executing insert query...');
    
    const result = await sequelize.query(insertQuery, {
      replacements: replacementValues,
      type: sequelize.QueryTypes.INSERT
    });

    const projectId = result[0];
    console.log('✅ Project created with ID:', projectId);

    // Get the created project with ALL fields
    const createdProject = await sequelize.query(
      `SELECT id, graduateId, title, description, category, impactArea,
              technologies, images, videos, documents, status, 
              fundingGoal, currentFunding, demoUrl, repoUrl, featured,
              createdAt, updatedAt 
       FROM Projects WHERE id = ?`,
      {
        replacements: [projectId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    console.log('🎉 Project created successfully:', createdProject[0]);

    res.status(201).json({
      message: 'Project created successfully',
      project: createdProject[0]
    });

  } catch (error) {
    console.error('💥 Project creation error:', error);
    console.error('💥 Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to create project',
      message: error.message 
    });
  }
});

// GET ALL PROJECTS (Fixed)
router.get('/', async (req, res) => {
  try {
    console.log('Fetching projects with query params:', req.query);
    
    const { search, graduateId } = req.query;
    
    let whereConditions = [`status IN ('active', 'completed')`];
    let queryParams = [];

  
    if (graduateId) {
      whereConditions.push('graduateId = ?');
      queryParams.push(graduateId);
    }
    
    if (search) {
      whereConditions.push('(title LIKE ? OR description LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    const query = `
      SELECT id, graduateId, title, description, category, impactArea,
             technologies, images, videos, documents, status, 
             fundingGoal, currentFunding, demoUrl, repoUrl, featured,
             createdAt, updatedAt 
      FROM Projects 
      WHERE ${whereClause}
      ORDER BY featured DESC, createdAt DESC
    `;
    
    console.log('Executing query:', query);
    console.log('With params:', queryParams);
    
    const projects = await sequelize.query(query, {
      replacements: queryParams,
      type: sequelize.QueryTypes.SELECT
    });

    console.log(`Found ${projects.length} projects`);

    // Parse JSON fields for response
    const projectsWithParsedData = projects.map(project => {
      try {
        const parsedProject = { ...project };
        
        // Parse all JSON fields
        ['technologies', 'images', 'videos', 'documents'].forEach(field => {
          if (project[field] && typeof project[field] === 'string') {
            try {
              parsedProject[field] = JSON.parse(project[field]);
            } catch (e) {
              parsedProject[field] = [];
            }
          } else if (!project[field]) {
            parsedProject[field] = [];
          }
        });
        
        return parsedProject;
      } catch (e) {
        console.error('Error processing project', project.id, ':', e);
        return {
          ...project,
          technologies: [],
          images: [],
          videos: [],
          documents: []
        };
      }

    });

    res.json({
      projects: projectsWithParsedData,
      total: projectsWithParsedData.length
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch projects',
      message: error.message 
    });
  }
});

// GET SINGLE PROJECT (Fixed)
router.get('/:id', async (req, res) => {
  try {
    const query = `
      SELECT id, graduateId, title, description, category, impactArea,
             technologies, images, videos, documents, status, 
             fundingGoal, currentFunding, demoUrl, repoUrl, featured,
             createdAt, updatedAt 
      FROM Projects 
      WHERE id = ?
    `;
    
    const projects = await sequelize.query(query, {
      replacements: [req.params.id],
      type: sequelize.QueryTypes.SELECT
    });

    if (projects.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const project = projects[0];




    const projectData = { ...project };
    
    // Parse all JSON fields
    ['technologies', 'images', 'videos', 'documents'].forEach(field => {
      if (project[field] && typeof project[field] === 'string') {
        try {
          projectData[field] = JSON.parse(project[field]);
        } catch (e) {
          projectData[field] = [];
        }
      } else if (!project[field]) {
        projectData[field] = [];
      }
    });

    res.json({ project: projectData });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// UPDATE PROJECT (Fixed)
router.put('/:id', auth, async (req, res) => {
  try {
    const checkQuery = `SELECT id, graduateId FROM Projects WHERE id = ?`;
    const projects = await sequelize.query(checkQuery, {
      replacements: [req.params.id],
      type: sequelize.QueryTypes.SELECT
    });
    
    if (projects.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const project = projects[0];


    if (project.graduateId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }


    const updateFields = [];
    const updateValues = [];
    
    // Include ALL updatable fields
    const allowedFields = [
      'title', 'description', 'category', 'impactArea', 'technologies', 
      'images', 'videos', 'documents', 'status', 'fundingGoal', 
      'demoUrl', 'repoUrl', 'featured'
    ];
    
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        if (['technologies', 'images', 'videos', 'documents'].includes(key)) {
          updateValues.push(JSON.stringify(req.body[key] || []));
        } else if (key === 'fundingGoal') {
          updateValues.push(req.body[key] ? parseFloat(req.body[key]) : null);
        } else {
          updateValues.push(req.body[key]);
        }
      }
    });
    
    if (updateFields.length > 0) {
      updateValues.push(req.params.id);
      
      const updateQuery = `
        UPDATE Projects 
        SET ${updateFields.join(', ')}, updatedAt = NOW() 
        WHERE id = ?
      `;
      
      await sequelize.query(updateQuery, {
        replacements: updateValues,
        type: sequelize.QueryTypes.UPDATE
      });
    }

    // Get updated project with ALL fields
    const updatedProjects = await sequelize.query(`
      SELECT id, graduateId, title, description, category, impactArea,
             technologies, images, videos, documents, status, 
             fundingGoal, currentFunding, demoUrl, repoUrl, featured,
             createdAt, updatedAt 
      FROM Projects 
      WHERE id = ?
    `, {
      replacements: [req.params.id],
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      message: 'Project updated successfully',
      project: updatedProjects[0]
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// DELETE PROJECT (unchanged)
router.delete('/:id', auth, async (req, res) => {
  try {
    const checkQuery = `SELECT id, graduateId FROM Projects WHERE id = ?`;
    const projects = await sequelize.query(checkQuery, {
      replacements: [req.params.id],
      type: sequelize.QueryTypes.SELECT
    });
    
    if (projects.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const project = projects[0];


    if (project.graduateId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }


    await sequelize.query('DELETE FROM Projects WHERE id = ?', {
      replacements: [req.params.id],
      type: sequelize.QueryTypes.DELETE
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;
