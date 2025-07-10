-- Drop existing tables in proper order to avoid foreign key issues
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS Interactions;
DROP TABLE IF EXISTS Projects;
DROP TABLE IF EXISTS GraduateProfiles;
DROP TABLE IF EXISTS InvestorProfiles;
DROP TABLE IF EXISTS Users;

SET FOREIGN_KEY_CHECKS = 1;

-- === Users Table ===
CREATE TABLE Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userType ENUM('graduate', 'investor', 'admin') NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  profileImage TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  isVerified BOOLEAN DEFAULT false,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- === Graduate Profiles ===
CREATE TABLE GraduateProfiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  aluDegreeDocument TEXT,
  graduationYear YEAR,
  specialization VARCHAR(255),
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- === Investor Profiles ===
CREATE TABLE InvestorProfiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  companyName VARCHAR(255),
  companyWebsite TEXT,
  investmentAreas TEXT,
  portfolioSize VARCHAR(100),
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- === Projects Table ===
CREATE TABLE Projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  graduateId INT,  -- ✅ Made nullable
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  impactArea VARCHAR(100),
  images TEXT,
  videos TEXT,
  documents TEXT,
  status ENUM('draft', 'published', 'under_review') DEFAULT 'under_review',
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (graduateId) REFERENCES Users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- === Interactions Table ===
CREATE TABLE Interactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  investorId INT NOT NULL,
  projectId INT NOT NULL,
  type ENUM('bookmark', 'interest', 'contact'),
  message TEXT,
  status VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (investorId) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (projectId) REFERENCES Projects(id) ON DELETE CASCADE
);
