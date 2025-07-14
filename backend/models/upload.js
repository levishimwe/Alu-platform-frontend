const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directories if they don't exist
const createUploadDirs = () => {
  const dirs = [
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../uploads/profiles'),
    path.join(__dirname, '../uploads/documents'),
    path.join(__dirname, '../uploads/projects'),
    path.join(__dirname, '../uploads/projects/images'),
    path.join(__dirname, '../uploads/projects/videos'),
    path.join(__dirname, '../uploads/projects/documents')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, '../uploads');
    
    if (file.fieldname === 'profileImage') {
      uploadPath = path.join(__dirname, '../uploads/profiles');
    } else if (file.fieldname === 'degree') {
      uploadPath = path.join(__dirname, '../uploads/documents');
    } else if (file.fieldname === 'images') {
      uploadPath = path.join(__dirname, '../uploads/projects/images');
    } else if (file.fieldname === 'videos') {
      uploadPath = path.join(__dirname, '../uploads/projects/videos');
    } else if (file.fieldname === 'documents') {
      uploadPath = path.join(__dirname, '../uploads/projects/documents');
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  console.log(`Processing file: ${file.fieldname}, type: ${file.mimetype}, size: ${file.size || 'unknown'}`);
  
  if (file.fieldname === 'profileImage' || file.fieldname === 'images') {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  } else if (file.fieldname === 'videos') {
    // Allow video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  } else if (file.fieldname === 'degree' || file.fieldname === 'documents') {
    // Allow PDF, DOC, DOCX for documents
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, TXT, PPT files are allowed'), false);
    }
  } else {
    cb(null, true);
  }
};

// Create different upload configurations for different file types
const createUpload = (maxSize) => {
  return multer({
    storage: storage,
    limits: {
      fileSize: maxSize,
      fieldSize: 50 * 1024 * 1024,  // 50MB for field data
      files: 20,                     // Maximum 20 files
      fields: 50                     // Maximum 50 fields
    },
    fileFilter: fileFilter
  });
};

// Different configurations for different routes
const uploadProfile = createUpload(5 * 1024 * 1024);  // 5MB for profile images
const uploadProjects = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024,  // 500MB for project files (increased)
    fieldSize: 50 * 1024 * 1024,  
    files: 20,                     
    fields: 50                     
  },
  fileFilter: fileFilter
});

// Export both configurations
module.exports = {
  uploadProfile,
  uploadProjects,
  // Default export for backward compatibility
  default: uploadProjects
};

// Also export uploadProjects as the main export
module.exports = uploadProjects;
