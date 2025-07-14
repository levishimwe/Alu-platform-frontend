const express = require('express');
const { Project, User } = require('../models');
const { sequelize } = require('../config/database'); // Import sequelize from config instead
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a new project with increased file size handling
router.post('/', auth, (req, res, next) => {
  console.log('Starting project upload...');
  
  // Create upload middleware with specific configuration for projects
  const projectUpload = upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 5 },
    { name: 'documents', maxCount: 10 }
  ]);

  projectUpload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ 
          error: 'File too large',
          message: `File "${err.field}" is too large. Maximum size allowed is 500MB.`,
          field: err.field
        });
      }
      
      return res.status(400).json({ 
        error: 'Upload error',
        message: err.message 
      });
    }

    try {
      const { title, description, category, impactArea, imageUrls, videoUrls, documentUrls } = req.body;
      const userId = req.user.userId;

      console.log('Creating project:', { title, description, category, impactArea });
      console.log('Files received:', req.files);
      console.log('URLs received:', { imageUrls, videoUrls, documentUrls });

      // Validation
      if (!title || !description) {
        return res.status(400).json({ 
          message: 'Title and description are required' 
        });
      }

      // Process uploaded files - FIXED to check for valid filenames
      let images = [];
      let videos = [];
      let documents = [];

      if (req.files) {
        // Process image files - check for valid filename
        if (req.files.images) {
          images = req.files.images
            .filter(file => file.filename && file.filename !== 'undefined')
            .map(file => `/uploads/projects/images/${file.filename}`);
        }
        
        // Process video files - check for valid filename
        if (req.files.videos) {
          videos = req.files.videos
            .filter(file => file.filename && file.filename !== 'undefined')
            .map(file => `/uploads/projects/videos/${file.filename}`);
        }
        
        // Process document files - check for valid filename
        if (req.files.documents) {
          documents = req.files.documents
            .filter(file => file.filename && file.filename !== 'undefined')
            .map(file => `/uploads/projects/documents/${file.filename}`);
        }
      }

      // Add URLs if provided - Fixed to handle empty/undefined values
      if (imageUrls && imageUrls !== 'undefined' && imageUrls.trim() !== '') {
        try {
          const parsedImageUrls = JSON.parse(imageUrls);
          if (Array.isArray(parsedImageUrls)) {
            const validUrls = parsedImageUrls.filter(url => url && url.trim() !== '' && url !== 'undefined');
            images = [...images, ...validUrls];
          }
        } catch (e) {
          console.error('Error parsing image URLs:', e);
        }
      }

      if (videoUrls && videoUrls !== 'undefined' && videoUrls.trim() !== '') {
        try {
          const parsedVideoUrls = JSON.parse(videoUrls);
          if (Array.isArray(parsedVideoUrls)) {
            const validUrls = parsedVideoUrls.filter(url => url && url.trim() !== '' && url !== 'undefined');
            videos = [...videos, ...validUrls];
          }
        } catch (e) {
          console.error('Error parsing video URLs:', e);
        }
      }

      if (documentUrls && documentUrls !== 'undefined' && documentUrls.trim() !== '') {
        try {
          const parsedDocumentUrls = JSON.parse(documentUrls);
          if (Array.isArray(parsedDocumentUrls)) {
            const validUrls = parsedDocumentUrls.filter(url => url && url.trim() !== '' && url !== 'undefined');
            documents = [...documents, ...validUrls];
          }
        } catch (e) {
          console.error('Error parsing document URLs:', e);
        }
      }

      console.log('Processed media arrays:', { images, videos, documents });

      // Convert arrays to JSON strings for storage (matching your table structure)
      // Only save if arrays have valid content
      const projectData = {
        title,
        description,
        category,
        impactArea,
        images: images.length > 0 ? JSON.stringify(images) : null,
        videos: videos.length > 0 ? JSON.stringify(videos) : null,
        documents: documents.length > 0 ? JSON.stringify(documents) : null,
        graduateId: userId
      };

      console.log('Project data to save:', projectData);

      // Create project
      const project = await Project.create(projectData);

      // Return the project without association for now
      res.status(201).json({
        message: 'Project created successfully',
        project: {
          ...project.toJSON(),
          images: projectData.images ? JSON.parse(projectData.images) : [],
          videos: projectData.videos ? JSON.parse(projectData.videos) : [],
          documents: projectData.documents ? JSON.parse(projectData.documents) : []
        }
      });

    } catch (error) {
      console.error('Project creation error:', error);
      res.status(500).json({ 
        message: 'Server error', 
        error: error.message 
      });
    }
  });
});

// Get all projects - Use raw query to avoid column issues (ONLY ONE GET ROUTE)
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

    console.log(`Raw projects from DB: ${projects.length}`);

    // Parse JSON fields for response with better error handling and filter invalid URLs
    const projectsWithParsedMedia = projects.map(project => {
      try {
        const parsedProject = { ...project };
        
        // Parse images and filter out invalid ones
        if (project.images && typeof project.images === 'string') {
          try {
            const parsedImages = JSON.parse(project.images);
            parsedProject.images = Array.isArray(parsedImages) 
              ? parsedImages.filter(img => img && !img.includes('undefined') && img.trim() !== '')
              : [];
          } catch (e) {
            console.error('Error parsing images for project', project.id, ':', project.images);
            parsedProject.images = [];
          }
        } else {
          parsedProject.images = [];
        }
        
        // Parse videos and filter out invalid ones
        if (project.videos && typeof project.videos === 'string') {
          try {
            const parsedVideos = JSON.parse(project.videos);
            parsedProject.videos = Array.isArray(parsedVideos) 
              ? parsedVideos.filter(video => video && !video.includes('undefined') && video.trim() !== '')
              : [];
          } catch (e) {
            console.error('Error parsing videos for project', project.id, ':', project.videos);
            parsedProject.videos = [];
          }
        } else {
          parsedProject.videos = [];
        }
        
        // Parse documents and filter out invalid ones
        if (project.documents && typeof project.documents === 'string') {
          try {
            const parsedDocuments = JSON.parse(project.documents);
            parsedProject.documents = Array.isArray(parsedDocuments) 
              ? parsedDocuments.filter(doc => doc && !doc.includes('undefined') && doc.trim() !== '')
              : [];
          } catch (e) {
            console.error('Error parsing documents for project', project.id, ':', project.documents);
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

    console.log(`Found ${projectsWithParsedMedia.length} projects after processing`);
    
    res.json({
      projects: projectsWithParsedMedia,
      total: projectsWithParsedMedia.length
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
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
