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

// Create a new project with URL validation
router.post('/', auth, [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required'),
  
  body('impactArea')
    .optional()
    .trim(),
  
  // Validate image URLs (Google Drive only)
  body('imageUrls')
    .optional()
    .custom((value) => {
      if (!value) return true;
      
      let urls;
      try {
        urls = Array.isArray(value) ? value : JSON.parse(value);
      } catch (e) {
        throw new Error('Invalid image URLs format');
      }
      
      if (!Array.isArray(urls)) {
        throw new Error('Image URLs must be an array');
      }
      
      for (const url of urls) {
        if (url && !validateGoogleDriveLink(url)) {
          throw new Error(`Image URL must be a Google Drive link: ${url}`);
        }
      }
      return true;
    }),
  
  // Validate video URLs (YouTube only)
  body('videoUrls')
    .optional()
    .custom((value) => {
      if (!value) return true;
      
      let urls;
      try {
        urls = Array.isArray(value) ? value : JSON.parse(value);
      } catch (e) {
        throw new Error('Invalid video URLs format');
      }
      
      if (!Array.isArray(urls)) {
        throw new Error('Video URLs must be an array');
      }
      
      for (const url of urls) {
        if (url && !validateYouTubeLink(url)) {
          throw new Error(`Video URL must be a YouTube link: ${url}`);
        }
      }
      return true;
    }),
  
  // Validate document URLs (Google Drive only)
  body('documentUrls')
    .optional()
    .custom((value) => {
      if (!value) return true;
      
      let urls;
      try {
        urls = Array.isArray(value) ? value : JSON.parse(value);
      } catch (e) {
        throw new Error('Invalid document URLs format');
      }
      
      if (!Array.isArray(urls)) {
        throw new Error('Document URLs must be an array');
      }
      
      for (const url of urls) {
        if (url && !validateGoogleDriveLink(url)) {
          throw new Error(`Document URL must be a Google Drive link: ${url}`);
        }
      }
      return true;
    }),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Project validation errors:', errors.array());
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { title, description, category, impactArea, imageUrls, videoUrls, documentUrls } = req.body;
    const userId = req.user.userId;

    console.log('Creating project:', { title, description, category, impactArea });
    console.log('URLs received:', { imageUrls, videoUrls, documentUrls });

    // Process and validate URLs
    let images = [];
    let videos = [];
    let documents = [];

    // Process image URLs (Google Drive only)
    if (imageUrls) {
      try {
        const parsedImageUrls = Array.isArray(imageUrls) ? imageUrls : JSON.parse(imageUrls);
        images = parsedImageUrls.filter(url => url && url.trim() !== '' && validateGoogleDriveLink(url));
      } catch (e) {
        console.error('Error parsing image URLs:', e);
      }
    }

    // Process video URLs (YouTube only)
    if (videoUrls) {
      try {
        const parsedVideoUrls = Array.isArray(videoUrls) ? videoUrls : JSON.parse(videoUrls);
        videos = parsedVideoUrls.filter(url => url && url.trim() !== '' && validateYouTubeLink(url));
      } catch (e) {
        console.error('Error parsing video URLs:', e);
      }
    }

    // Process document URLs (Google Drive only)
    if (documentUrls) {
      try {
        const parsedDocumentUrls = Array.isArray(documentUrls) ? documentUrls : JSON.parse(documentUrls);
        documents = parsedDocumentUrls.filter(url => url && url.trim() !== '' && validateGoogleDriveLink(url));
      } catch (e) {
        console.error('Error parsing document URLs:', e);
      }
    }

    console.log('Processed and validated URLs:', { images, videos, documents });

// Create project data matching the updated model
const projectData = {
  title,
  description,
  category,
  impactArea,
  images: images, // Will be converted to JSON string by model
  videos: videos, // Will be converted to JSON string by model  
  documents: documents, // Will be converted to JSON string by model
  graduateId: userId,
  status: 'published' // Valid values: 'draft', 'published', 'under_review'
};

console.log('Project data to save:', projectData);

// Create project
const project = await Project.create(projectData);

    res.status(201).json({
      message: 'Project created successfully',
      project: {
        ...project.toJSON(),
        images: images,
        videos: videos,
        documents: documents
      }
    });

  } catch (error) {
    console.error('💥 Project creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create project',
      message: error.message 
    });
  }
});

// Get all projects (existing code - no changes needed)
router.get('/', async (req, res) => {
  try {
    console.log('Fetching projects with query params:', req.query);
    
    const { category, search, graduateId } = req.query;
    
    let whereConditions = [`status = 'published'`];
    let queryParams = [];
    
    if (category) {
      whereConditions.push('category = ?');
      queryParams.push(category);
    }
    
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
             images, videos, documents, views, likes, status, 
             createdAt, updatedAt 
      FROM Projects 
      WHERE ${whereClause} 
      ORDER BY createdAt DESC
    `;
    
    console.log('Executing query:', query);
    console.log('With params:', queryParams);
    
    const projects = await sequelize.query(query, {
      replacements: queryParams,
      type: sequelize.QueryTypes.SELECT
    });

    console.log(`Found ${projects.length} projects`);

    // Parse JSON fields for response
    const projectsWithParsedMedia = projects.map(project => {
      try {
        const parsedProject = { ...project };
        
        // Parse and validate images (Google Drive)
        if (project.images && typeof project.images === 'string') {
          try {
            const parsedImages = JSON.parse(project.images);
            parsedProject.images = Array.isArray(parsedImages) 
              ? parsedImages.filter(img => img && validateGoogleDriveLink(img))
              : [];
          } catch (e) {

            parsedProject.images = [];
          }
        } else {
          parsedProject.images = [];
        }
        
        // Parse and validate videos (YouTube)
        if (project.videos && typeof project.videos === 'string') {
          try {
            const parsedVideos = JSON.parse(project.videos);
            parsedProject.videos = Array.isArray(parsedVideos) 
              ? parsedVideos.filter(video => video && validateYouTubeLink(video))
              : [];
          } catch (e) {

            parsedProject.videos = [];
          }
        } else {
          parsedProject.videos = [];
        }
        
        // Parse and validate documents (Google Drive)
        if (project.documents && typeof project.documents === 'string') {
          try {
            const parsedDocuments = JSON.parse(project.documents);
            parsedProject.documents = Array.isArray(parsedDocuments) 
              ? parsedDocuments.filter(doc => doc && validateGoogleDriveLink(doc))
              : [];
          } catch (e) {

            parsedProject.documents = [];
          }
        } else {
          parsedProject.documents = [];
        }
        
        return parsedProject;
      } catch (e) {
        console.error('Error processing project', project.id, ':', e);
        return {
          ...project,
          images: [],
          videos: [],
          documents: []
        };
      }

    });

    res.json({
      projects: projectsWithParsedMedia,
      total: projectsWithParsedMedia.length
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch projects',
      message: error.message 
    });
  }
});

// Get single project - Use raw query
router.get('/:id', async (req, res) => {
  try {
    const query = `
      SELECT id, graduateId, title, description, category, impactArea, 
             images, videos, documents, views, likes, status, 
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

    // Increment views
    await sequelize.query('UPDATE Projects SET views = views + 1 WHERE id = ?', {
      replacements: [req.params.id],
      type: sequelize.QueryTypes.UPDATE
    });

    // Parse JSON fields with better error handling and filter invalid URLs
    const projectData = { ...project };
    
    // Parse images and filter out invalid ones
    if (project.images && typeof project.images === 'string') {
      try {
        const parsedImages = JSON.parse(project.images);
        projectData.images = Array.isArray(parsedImages) 
          ? parsedImages.filter(img => img && !img.includes('undefined') && img.trim() !== '')
          : [];
      } catch (e) {
        console.error('Error parsing images:', project.images);
        projectData.images = [];
      }
    } else {
      projectData.images = [];
    }
    
    // Parse videos and filter out invalid ones
    if (project.videos && typeof project.videos === 'string') {
      try {
        const parsedVideos = JSON.parse(project.videos);
        projectData.videos = Array.isArray(parsedVideos) 
          ? parsedVideos.filter(video => video && !video.includes('undefined') && video.trim() !== '')
          : [];
      } catch (e) {
        console.error('Error parsing videos:', project.videos);
        projectData.videos = [];
      }
    } else {
      projectData.videos = [];
    }
    
    // Parse documents and filter out invalid ones
    if (project.documents && typeof project.documents === 'string') {
      try {
        const parsedDocuments = JSON.parse(project.documents);
        projectData.documents = Array.isArray(parsedDocuments) 
          ? parsedDocuments.filter(doc => doc && !doc.includes('undefined') && doc.trim() !== '')
          : [];
      } catch (e) {
        console.error('Error parsing documents:', project.documents);
        projectData.documents = [];
      }
    } else {
      projectData.documents = [];
    }

    projectData.views = project.views + 1; // Update the view count in response

    res.json({ project: projectData });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Update project - Use raw query
router.put('/:id', auth, async (req, res) => {
  try {
    // First check if project exists and user owns it
    const checkQuery = `
      SELECT id, graduateId FROM Projects WHERE id = ?
    `;
    
    const projects = await sequelize.query(checkQuery, {
      replacements: [req.params.id],
      type: sequelize.QueryTypes.SELECT
    });
    
    if (projects.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const project = projects[0];

    // Check if user owns the project
    if (project.graduateId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    // Update the project
    const updateFields = [];
    const updateValues = [];
    
    Object.keys(req.body).forEach(key => {
      if (['title', 'description', 'category', 'impactArea', 'status'].includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(req.body[key]);
      }
    });
    
    if (updateFields.length > 0) {
      updateValues.push(req.params.id); // Add ID for WHERE clause
      
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

    // Get updated project
    const updatedProjects = await sequelize.query(`
      SELECT id, graduateId, title, description, category, impactArea, 
             images, videos, documents, views, likes, status, 
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

// Delete project - Use raw query
router.delete('/:id', auth, async (req, res) => {
  try {
    // First check if project exists and user owns it
    const checkQuery = `
      SELECT id, graduateId FROM Projects WHERE id = ?
    `;
    
    const projects = await sequelize.query(checkQuery, {
      replacements: [req.params.id],
      type: sequelize.QueryTypes.SELECT
    });
    
    if (projects.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const project = projects[0];

    // Check if user owns the project
    if (project.graduateId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    // Delete the project
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
