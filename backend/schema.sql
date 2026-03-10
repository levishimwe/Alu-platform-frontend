CREATE DATABASE IF NOT EXISTS alu_platform;
USE alu_platform;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS EmailMessages;
DROP TABLE IF EXISTS Messages;
DROP TABLE IF EXISTS Conversations;
DROP TABLE IF EXISTS Interactions;
DROP TABLE IF EXISTS Projects;
DROP TABLE IF EXISTS GraduateProfiles;
DROP TABLE IF EXISTS InvestorProfiles;
DROP TABLE IF EXISTS Users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  userType ENUM('graduate', 'investor', 'admin') NOT NULL DEFAULT 'graduate',
  profileImage TEXT NULL,
  bio TEXT NULL,
  skills JSON NULL,
  university VARCHAR(255) NULL,
  graduationYear INT NULL,
  degreeCertificate TEXT NULL,
  companyName VARCHAR(255) NULL,
  companyWebsite VARCHAR(255) NULL,
  country VARCHAR(100) NULL,
  city VARCHAR(100) NULL,
  isVerified BOOLEAN NOT NULL DEFAULT FALSE,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  lastLogin DATETIME NULL,
  gmailAccessToken TEXT NULL,
  gmailRefreshToken TEXT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_userType (userType),
  INDEX idx_users_isActive (isActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE GraduateProfiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NULL,
  graduationYear INT NULL,
  major VARCHAR(255) NULL,
  skills JSON NULL,
  projects JSON NULL,
  experience TEXT NULL,
  achievements JSON NULL,
  portfolio VARCHAR(500) NULL,
  portfolioUrl VARCHAR(500) NULL,
  linkedinUrl VARCHAR(500) NULL,
  githubUrl VARCHAR(500) NULL,
  availability ENUM('available', 'busy', 'not_available') NOT NULL DEFAULT 'available',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_graduate_profiles_userId (userId),
  CONSTRAINT fk_graduate_profiles_user
    FOREIGN KEY (userId) REFERENCES Users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE InvestorProfiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NULL,
  investmentFocus JSON NULL,
  investmentRange VARCHAR(100) NULL,
  portfolio JSON NULL,
  linkedinProfile VARCHAR(500) NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  company VARCHAR(255) NULL,
  position VARCHAR(255) NULL,
  investment_focus TEXT NULL,
  investment_range VARCHAR(100) NULL,
  linkedinUrl VARCHAR(500) NULL,
  companyWebsite VARCHAR(500) NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_investor_profiles_userId (userId),
  CONSTRAINT fk_investor_profiles_user
    FOREIGN KEY (userId) REFERENCES Users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  graduateId INT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NULL,
  impactArea VARCHAR(100) NULL,
  technologies JSON NULL,
  images JSON NULL,
  videos JSON NULL,
  documents JSON NULL,
  status ENUM('draft', 'pending', 'active', 'completed', 'rejected', 'under_review', 'published') NOT NULL DEFAULT 'draft',
  fundingGoal DECIMAL(10,2) NULL,
  currentFunding DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  demoUrl VARCHAR(500) NULL,
  repoUrl VARCHAR(500) NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  views INT NOT NULL DEFAULT 0,
  likes INT NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_projects_graduateId (graduateId),
  INDEX idx_projects_status (status),
  INDEX idx_projects_createdAt (createdAt),
  CONSTRAINT fk_projects_graduate
    FOREIGN KEY (graduateId) REFERENCES Users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Interactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('like', 'view', 'contact', 'favorite') NOT NULL,
  userId INT NOT NULL,
  targetId INT NOT NULL,
  targetType ENUM('project', 'user') NOT NULL,
  investorId INT NULL,
  projectId INT NULL,
  message TEXT NULL,
  status VARCHAR(100) NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_interactions_userId (userId),
  INDEX idx_interactions_target (targetType, targetId),
  INDEX idx_interactions_projectId (projectId),
  CONSTRAINT fk_interactions_user
    FOREIGN KEY (userId) REFERENCES Users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_interactions_investor
    FOREIGN KEY (investorId) REFERENCES Users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_interactions_project
    FOREIGN KEY (projectId) REFERENCES Projects(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user1Id INT NOT NULL,
  user2Id INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_conversation_pair (user1Id, user2Id),
  INDEX idx_conversations_user1 (user1Id),
  INDEX idx_conversations_user2 (user2Id),
  CONSTRAINT fk_conversations_user1
    FOREIGN KEY (user1Id) REFERENCES Users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_conversations_user2
    FOREIGN KEY (user2Id) REFERENCES Users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  senderId INT NOT NULL,
  receiverId INT NOT NULL,
  subject VARCHAR(255) NOT NULL DEFAULT 'No Subject',
  content TEXT NOT NULL,
  isRead BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_messages_sender (senderId),
  INDEX idx_messages_receiver (receiverId),
  INDEX idx_messages_createdAt (createdAt),
  CONSTRAINT fk_messages_sender
    FOREIGN KEY (senderId) REFERENCES Users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_messages_receiver
    FOREIGN KEY (receiverId) REFERENCES Users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE EmailMessages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  senderId INT NOT NULL,
  recipientEmail VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status ENUM('pending', 'sent', 'failed') NOT NULL DEFAULT 'sent',
  sentAt DATETIME NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email_messages_sender (senderId),
  INDEX idx_email_messages_sentAt (sentAt),
  CONSTRAINT fk_email_messages_sender
    FOREIGN KEY (senderId) REFERENCES Users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
