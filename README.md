# ALU Platform Frontend - Graduate Project Showcase

A modern web platform connecting ALU (African Leadership University) graduates with potential investors, enabling graduates to showcase their innovative projects and investors to discover funding opportunities.

## 🌟 Features

### For Graduates
- **Project Upload & Management**: Upload projects with images, videos, and documents
- **Media Support**: Google Drive integration for images/documents, YouTube for videos
- **Dashboard Analytics**: Track views, likes, and project performance
- **Profile Management**: Complete graduate profiles with skills and achievements

### For Investors
- **Project Discovery**: Browse and search through graduate projects
- **Advanced Filtering**: Filter by category, impact area, and keywords
- **Project Bookmarking**: Save interesting projects for later review
- **Detailed Project Views**: View full project details with media gallery

### For Admins
- **Platform Management**: Oversee users, projects, and platform analytics
- **Content Moderation**: Review and approve projects
- **User Management**: Manage graduate and investor accounts

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful SVG icons
- **Context API** - State management for authentication

### Backend
- **Node.js & Express** - RESTful API server
- **Sequelize ORM** - Database modeling and queries
- **MySQL** - Primary database
- **JWT Authentication** - Secure user sessions
- **Multer** - File upload handling

## 📁 Project Structure

```
Alu-platform-frontend/
├── src/
│   ├── components/
│   │   ├── auth/                    # Authentication components
│   │   │   ├── AuthModal.js         # Login/Register modal
│   │   │   └── ...
│   │   ├── common/                  # Reusable components
│   │   │   ├── Navigation.js        # Main navigation bar
│   │   │   ├── ProjectCard.js       # Project display card
│   │   │   ├── Footer.js            # Site footer
│   │   │   └── ...
│   │   ├── dashboard/               # Graduate dashboard
│   │   │   ├── GraduateDashboard.js # Main dashboard
│   │   │   ├── ProjectUploadModal.js # Project upload form
│   │   │   └── ...
│   │   ├── investor/                # Investor portal
│   │   │   ├── InvestorPortal.js    # Project browsing interface
│   │   │   └── ...
│   │   ├── admin/                   # Admin panel
│   │   │   ├── AdminPanel.js        # Admin management interface
│   │   │   └── ...
│   │   ├── projects/                # Project-related components
│   │   │   ├── ProjectDetails.js    # Detailed project view modal
│   │   │   ├── ProjectForm.js       # Project creation/editing
│   │   │   └── ...
│   │   └── pages/                   # Main pages
│   │       ├── Homepage.js          # Landing page
│   │       └── ...
│   ├── context/                     # React Context providers
│   │   └── AuthContext.js           # Authentication state management
│   ├── hooks/                       # Custom React hooks
│   │   └── useSimpleAPI.js          # API interaction hooks
│   ├── styles/                      # Global styles
│   │   └── index.css                # Tailwind CSS imports
│   ├── App.js                       # Main app component with routing
│   └── index.js                     # App entry point
├── backend/
│   ├── models/                      # Database models
│   │   ├── Project.js               # Project data model
│   │   ├── User.js                  # User authentication model
│   │   └── ...
│   ├── routes/                      # API endpoints
│   │   ├── projects.js              # Project CRUD operations
│   │   ├── auth.js                  # Authentication routes
│   │   └── ...
│   ├── middleware/                  # Express middleware
│   │   └── auth.js                  # JWT authentication middleware
│   └── server.js                    # Express server setup
└── README.md
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Alu-platform-frontend.git
cd Alu-platform-frontend
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure your .env file
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=alu_platform
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 3. Database Setup
```sql
-- Create database
CREATE DATABASE alu_platform;

-- Use the database
USE alu_platform;

-- Tables will be created automatically by Sequelize
```

### 4. Start Backend Server
```bash
npm start
# Server runs on http://localhost:5000
```

### 5. Frontend Setup
```bash
# Navigate to frontend directory (new terminal)
cd src

# Install dependencies
npm install

# Start development server
npm start
# Frontend runs on http://localhost:3000
```

## 🎯 Key Components Explained

### Authentication System

#### `AuthContext.js`
- Manages global authentication state
- Handles login/logout operations
- Provides user data across components
- JWT token management

#### `AuthModal.js`
- Unified login/register interface
- Form validation and error handling
- Role-based registration (Graduate/Investor)

### Project Management

#### `ProjectCard.js`
- Displays project preview with thumbnail
- Shows project metadata (category, impact area)
- Google Drive image URL conversion
- Responsive design for all screen sizes

#### `ProjectDetails.js`
- Full project view in modal format
- Media gallery with image/video display
- Google Drive → Direct image URL conversion
- YouTube → Embedded video conversion
- Document links with download options

#### `ProjectUploadModal.js`
- Multi-step project creation form
- File upload with validation
- Real-time preview functionality
- Integration with Google Drive links

### Dashboard Components

#### `GraduateDashboard.js`
- Personal project management interface
- Project statistics and analytics
- Quick project creation access
- Project editing capabilities

#### `InvestorPortal.js`
- Project discovery interface
- Advanced search and filtering
- Project bookmarking system
- Category-based browsing

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE Users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  userType ENUM('graduate', 'investor', 'admin'),
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### Projects Table
```sql
CREATE TABLE Projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(255),
  impactArea VARCHAR(255),
  images TEXT, -- JSON string of image URLs
  videos TEXT, -- JSON string of video URLs
  documents TEXT, -- JSON string of document URLs
  status ENUM('draft', 'published', 'under_review'),
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  graduateId INT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (graduateId) REFERENCES Users(id)
);
```

## 🌐 API Endpoints

### Authentication
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
GET  /api/auth/profile      # Get user profile
```

### Projects
```
GET    /api/projects              # Get all projects
GET    /api/projects/:id          # Get specific project
POST   /api/projects              # Create new project
PUT    /api/projects/:id          # Update project
DELETE /api/projects/:id          # Delete project
GET    /api/projects?graduateId=X # Get projects by graduate
```

## 🚀 Media Integration

### Google Drive Images
```javascript
// Convert sharing URL to direct image URL
const convertGoogleDriveImageUrl = (shareUrl) => {
  const fileIdRegex = /\/file\/d\/([a-zA-Z0-9-_]+)/;
  const match = shareUrl.match(fileIdRegex);
  
  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/uc?id=${fileId}&export=view`;
  }
  return shareUrl;
};
```

### YouTube Video Embedding
```javascript
// Convert YouTube URL to embeddable format
const convertYouTubeToEmbed = (youtubeUrl) => {
  const videoIdRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9-_]+)/;
  const match = youtubeUrl.match(videoIdRegex);
  
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return youtubeUrl;
};
```

## 🧪 Common Issues & Solutions

### 1. Images not displaying
- Check Google Drive link format
- Verify URL conversion function
- Ensure proper CORS settings

### 2. Authentication errors
- Verify JWT token format
- Check token expiration
- Confirm user permissions

### 3. Database connection issues
- Verify MySQL server status
- Check database credentials
- Confirm table structure

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)
```bash
# Build production version
npm run build

# Deploy build folder
# Configure environment variables
# Set up custom domain
```

### Backend Deployment (Heroku/DigitalOcean)
```bash
# Prepare for deployment
npm run build

# Configure production database
# Set environment variables
# Deploy to hosting platform
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/new-feature`)
3. **Commit changes** (`git commit -m 'Add new feature'`)
4. **Push to branch** (`git push origin feature/new-feature`)
5. **Open Pull Request**

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Frontend Development**: React.js, Tailwind CSS
- **Backend Development**: Node.js, Express, MySQL
- **UI/UX Design**: Modern, responsive interface
- **Project Management**: Agile development methodology

---

**Built with ❤️ for the ALU community**
