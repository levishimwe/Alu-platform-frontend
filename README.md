# ALU Platform - Graduate Project Showcase & Investor Connection Platform

A modern web platform connecting ALU (African Leadership University) graduates with potential investors, enabling graduates to showcase their innovative projects and investors to discover funding opportunities.

## 🌟 Features

### For Graduates
- **Project Upload & Management**: Create and manage project portfolios
- **Profile Management**: Complete profiles with skills, achievements, and contact information
- **Dashboard Analytics**: Track project views and engagement
- **Messaging System**: Direct communication with potential investors

### For Investors
- **Project Discovery**: Browse and search graduate projects
- **Advanced Filtering**: Filter by category, impact area, and keywords
- **Messaging System**: Connect directly with graduates
- **Investment Tracking**: Bookmark and track interesting projects

### For Admins
- **Platform Management**: Oversee users, projects, and platform analytics
- **Content Moderation**: Review and approve projects
- **User Management**: Manage graduate and investor accounts

## 🛠 Tech Stack

- **Frontend**: React 18, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js, MySQL
- **Authentication**: JWT tokens
- **Database**: MySQL with foreign key relationships

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 16.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MySQL** (version 8.0 or higher) - [Download here](https://dev.mysql.com/downloads/)
- **Git** - [Download here](https://git-scm.com/)

### Verify Prerequisites
Run these commands to verify your installations:
```bash
node --version    # Should show v16.0 or higher
npm --version     # Should show version number
mysql --version   # Should show MySQL version
git --version     # Should show Git version
```

## 🚀 Complete Setup Guide

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/Alu-platform-frontend.git

# Navigate to the project directory
cd Alu-platform-frontend
```

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Install Backend Dependencies
```bash
# Install all backend dependencies
npm install
```

#### 2.3 Create Environment File
```bash
# Copy the environment template
cp .env.example .env

# Or create .env file manually if template doesn't exist
touch .env
```

#### 2.4 Configure Environment Variables
Open the `.env` file in your text editor and add the following:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=alu_platform
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

**Important**: Replace `your_mysql_password` with your actual MySQL password and `your_super_secret_jwt_key_here_make_it_long_and_complex` with a strong secret key.

### Step 3: Database Setup

#### 3.1 Start MySQL Server
```bash
# On macOS (if using Homebrew)
brew services start mysql

# On Windows (if MySQL service is installed)
net start mysql

# On Linux (Ubuntu/Debian)
sudo service mysql start
```

#### 3.2 Access MySQL and Create Database
```bash
# Access MySQL command line
mysql -u root -p
# Enter your MySQL password when prompted
```

#### 3.3 Run Database Commands
In the MySQL command line, run these commands one by one:

```sql
-- Create the database
CREATE DATABASE alu_platform;

-- Use the database
USE alu_platform;

-- Create Users table
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    userType ENUM('graduate', 'investor', 'admin') NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(255),
    bio TEXT,
    profile_picture VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_user_type (userType),
    INDEX idx_created_at (created_at)
);

-- Create Projects table
CREATE TABLE Projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(255),
    impactArea VARCHAR(255),
    images TEXT,
    videos TEXT,
    documents TEXT,
    status ENUM('draft', 'published', 'under_review') DEFAULT 'draft',
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    graduateId INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (graduateId) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_graduate_id (graduateId),
    INDEX idx_status (status),
    INDEX idx_category (category)
);

-- Create Profile tables
CREATE TABLE GraduateProfiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    university VARCHAR(255),
    graduationYear INT,
    major VARCHAR(255),
    skills TEXT,
    achievements TEXT,
    portfolio_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user (userId)
);

CREATE TABLE InvestorProfiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    company VARCHAR(255),
    position VARCHAR(255),
    investment_focus TEXT,
    investment_range VARCHAR(100),
    contact_preferences TEXT,
    linkedin_url VARCHAR(500),
    company_website VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user (userId)
);

-- Create messaging tables
CREATE TABLE message_threads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    participant_1_id INT NOT NULL,
    participant_2_id INT NOT NULL,
    last_message_id INT,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (participant_1_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_2_id) REFERENCES Users(id) ON DELETE CASCADE,
    
    INDEX idx_participants (participant_1_id, participant_2_id),
    INDEX idx_last_activity (last_activity),
    UNIQUE KEY unique_participants (participant_1_id, participant_2_id)
);

CREATE TABLE Messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    thread_id INT,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sender_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (thread_id) REFERENCES message_threads(id) ON DELETE CASCADE,
    
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_thread_id (thread_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read)
);

-- Create notifications table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('message', 'project_update', 'investment_request', 'system') DEFAULT 'message',
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    related_id INT,
    related_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
);

-- Exit MySQL
EXIT;
```

#### 3.4 Verify Database Setup
```bash
# Access MySQL again to verify
mysql -u root -p

# Check if database and tables were created
USE alu_platform;
SHOW TABLES;

# Should show:
# +------------------------+
# | Tables_in_alu_platform |
# +------------------------+
# | GraduateProfiles       |
# | InvestorProfiles       |
# | Messages               |
# | Projects               |
# | Users                  |
# | message_threads        |
# | notifications          |
# +------------------------+

EXIT;
```

### Step 4: Start Backend Server

```bash
# Make sure you're in the backend directory
cd backend

# Start the backend server
npm start

# You should see:
# Server running on port 5000
# Database connected successfully
```

**Keep this terminal window open** - the backend server needs to keep running.

### Step 5: Frontend Setup

#### 5.1 Open New Terminal Window
Open a new terminal window/tab and navigate to the frontend directory:

```bash
cd /path/to/Alu-platform-frontend
# (or wherever you cloned the project)
```

#### 5.2 Install Frontend Dependencies
```bash
# Install all frontend dependencies
npm install

# This will install React, Tailwind CSS, and all other dependencies
```

#### 5.3 Install Additional Dependencies
```bash
# Install date-fns for messaging system
npm install date-fns

# Install any other missing dependencies if prompted
```

#### 5.4 Start Frontend Development Server
```bash
# Start the React development server
npm start

# You should see:
# Compiled successfully!
# Local:            http://localhost:3000
# On Your Network:  http://192.168.x.x:3000
```

Your browser should automatically open to `http://localhost:3000`.

### Step 6: Verify Installation

#### 6.1 Check Backend Status
- Visit `http://localhost:5000` in your browser
- You should see a message like "ALU Platform API is running"

#### 6.2 Check Frontend Status
- Visit `http://localhost:3000` in your browser
- You should see the ALU Platform homepage

#### 6.3 Test Basic Functionality
1. **Registration**: Click "LOGIN/REGISTER" and create a new account
2. **Login**: Log in with your new account
3. **Navigation**: Test the navigation menu
4. **Dashboard**: Access your user dashboard

## 🎯 Project Structure

```
Alu-platform-frontend/
├── backend/
│   ├── models/              # Database models
│   ├── routes/              # API endpoints
│   ├── middleware/          # Express middleware
│   ├── server.js           # Main server file
│   └── .env                # Environment variables
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   ├── common/         # Reusable components
│   │   ├── dashboard/      # User dashboards
│   │   ├── profile/        # Profile components
│   │   ├── messaging/      # Messaging system
│   │   ├── projects/       # Project components
│   │   └── pages/          # Main pages
│   ├── context/            # React Context
│   ├── styles/             # CSS styles
│   ├── App.js              # Main app component
│   └── index.js            # Entry point
├── package.json            # Frontend dependencies
└── README.md              # This file
```

## 🧪 Testing the Application

### Test User Accounts
Create these test accounts to fully test the system:

1. **Graduate Account**:
   - Email: `graduate@test.com`
   - Password: `password123`
   - User Type: Graduate

2. **Investor Account**:
   - Email: `investor@test.com`
   - Password: `password123`
   - User Type: Investor

3. **Admin Account**:
   - Email: `admin@test.com`
   - Password: `password123`
   - User Type: Admin

### Test Features
1. **Graduate Features**:
   - Create and edit projects
   - Update profile information
   - Send/receive messages

2. **Investor Features**:
   - Browse projects
   - Contact graduates
   - Manage profile

3. **Admin Features**:
   - View all users and projects
   - Manage platform content

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. "Module not found" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

#### 2. Database connection failed
- Check if MySQL server is running
- Verify database credentials in `.env` file
- Ensure database `alu_platform` exists

#### 3. Port already in use
```bash
# Kill process using port 3000 or 5000
npx kill-port 3000
npx kill-port 5000
```

#### 4. JWT authentication errors
- Check `JWT_SECRET` in your `.env` file
- Clear browser localStorage: `localStorage.clear()`

#### 5. CORS errors
- Ensure backend is running on port 5000
- Check `FRONTEND_URL` in `.env` file

### Getting Help
If you encounter issues:
1. Check the browser console for error messages
2. Check the backend terminal for server errors
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed

## 🎉 Success!

If you've followed all steps correctly, you should now have:

✅ **Backend server** running on `http://localhost:5000`
✅ **Frontend application** running on `http://localhost:3000`
✅ **MySQL database** with all required tables
✅ **User authentication** system working
✅ **Project management** functionality
✅ **Messaging system** operational
✅ **Profile management** for graduates and investors

## 🚀 Next Steps

Now that your platform is running:

1. **Create your first graduate account**
2. **Upload a test project**
3. **Create an investor account**
4. **Test the messaging system**
5. **Explore all features**

## 📞 Support

If you need help:
- Check the troubleshooting section above
- Review the error messages in your terminal/browser console
- Ensure all prerequisites are properly installed

---

**🎓 Built for the ALU community - Connecting graduates with opportunities!**
