const express = require('express');
const auth = require('../middleware/auth');
const { sequelize } = require('../config/database');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const router = express.Router();

// Gmail OAuth client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/auth/google/callback'
);

// Get Gmail auth URL
router.get('/auth/gmail', auth, (req, res) => {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: req.user.userId // Add user ID to track the request
    });

    console.log('Generated Gmail auth URL for user:', req.user.userId);
    res.json({ authUrl });
  } catch (error) {
    console.error('Gmail auth URL error:', error);
    res.status(500).json({ 
      error: 'Failed to generate auth URL',
      message: error.message 
    });
  }
});

// Handle Gmail OAuth callback
router.post('/auth/gmail/callback', auth, async (req, res) => {
  try {
    const { code, error, error_description } = req.body;
    
    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error, error_description);
      
      if (error === 'access_denied') {
        return res.status(403).json({ 
          error: 'access_denied',
          message: 'Gmail access was denied. The app needs to be verified by Google or you need to be added as a test user.',
          userMessage: 'Gmail access is currently restricted. Please contact the administrator to be added as a test user.'
        });
      }
      
      return res.status(400).json({ 
        error: 'oauth_error',
        message: error_description || 'OAuth authentication failed',
        userMessage: 'Failed to connect to Gmail. Please try again.'
      });
    }

    if (!code) {
      return res.status(400).json({ 
        error: 'missing_code',
        message: 'Authorization code is required',
        userMessage: 'Invalid authentication response. Please try again.'
      });
    }
    
    console.log('Processing Gmail callback for user:', req.user.userId);
    
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens in database
    await sequelize.query(`
      UPDATE Users 
      SET gmailAccessToken = ?, gmailRefreshToken = ?, updatedAt = NOW()
      WHERE id = ?
    `, {
      replacements: [
        tokens.access_token,
        tokens.refresh_token,
        req.user.userId
      ],
      type: sequelize.QueryTypes.UPDATE
    });

    console.log('Gmail tokens stored successfully for user:', req.user.userId);
    res.json({ 
      message: 'Gmail authentication successful',
      success: true 
    });
  } catch (error) {
    console.error('Gmail callback error:', error);
    
    // Handle specific Google API errors
    if (error.message.includes('invalid_grant')) {
      return res.status(400).json({ 
        error: 'invalid_grant',
        message: 'Authorization code has expired or is invalid',
        userMessage: 'Authentication expired. Please try connecting Gmail again.'
      });
    }
    
    if (error.message.includes('access_denied')) {
      return res.status(403).json({ 
        error: 'access_denied',
        message: 'Access denied by Google OAuth',
        userMessage: 'Gmail access is currently restricted. Please contact the administrator.'
      });
    }
    
    res.status(500).json({ 
      error: 'authentication_failed',
      message: error.message,
      userMessage: 'Failed to connect Gmail. Please try again later.'
    });
  }
});

// Send email through user's Gmail (OAuth method)
router.post('/send', auth, async (req, res) => {
  try {
    const { to, subject, message, recipientName } = req.body;
    console.log('Sending email from user:', req.user.userId, 'to:', to);

    // Validate input
    if (!to || !subject || !message) {
      return res.status(400).json({
        error: 'missing_fields',
        message: 'Recipient, subject, and message are required',
        userMessage: 'Please fill in all required fields.'
      });
    }

    // Get user's Gmail tokens
    const userTokens = await sequelize.query(`
      SELECT email, gmailAccessToken, gmailRefreshToken 
      FROM Users 
      WHERE id = ?
    `, {
      replacements: [req.user.userId],
      type: sequelize.QueryTypes.SELECT
    });

    if (!userTokens[0] || !userTokens[0].gmailAccessToken) {
      return res.status(400).json({ 
        error: 'gmail_not_connected',
        message: 'Gmail not connected',
        userMessage: 'Please connect your Gmail account first'
      });
    }

    const user = userTokens[0];
    
    // Set OAuth credentials
    oauth2Client.setCredentials({
      access_token: user.gmailAccessToken,
      refresh_token: user.gmailRefreshToken
    });

    // FIXED: Create transporter with correct method name
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: user.email,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: user.gmailRefreshToken,
        accessToken: user.gmailAccessToken
      }
    });

    // Verify transporter connection
    await transporter.verify();

    // Create email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">ALU Platform</h1>
          <p style="color: white; margin: 5px 0;">Message from ${user.email}</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hello ${recipientName || 'there'},
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This message was sent through the ALU Platform messaging system.
          </p>
        </div>
        
        <div style="background: #333; padding: 15px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © 2025 ALU Platform. All rights reserved.
          </p>
        </div>
      </div>
    `;

    // Send email
    const result = await transporter.sendMail({
      from: user.email,
      to: to,
      subject: subject,
      html: emailHtml,
      text: `Hello ${recipientName || 'there'},\n\n${message}\n\nSent via ALU Platform from ${user.email}`
    });

    // Log the message in EmailMessages table
    await sequelize.query(`
      INSERT INTO EmailMessages (senderId, recipientEmail, subject, content, status, sentAt, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, 'sent', NOW(), NOW(), NOW())
    `, {
      replacements: [req.user.userId, to, subject, message],
      type: sequelize.QueryTypes.INSERT
    });

    console.log('Email sent successfully:', result.messageId);
    res.json({ 
      message: 'Email sent successfully',
      messageId: result.messageId,
      success: true
    });

  } catch (error) {
    console.error('Send email error:', error);
    
    // Handle specific email sending errors
    if (error.message.includes('Invalid login')) {
      return res.status(401).json({ 
        error: 'invalid_credentials',
        message: 'Gmail authentication expired',
        userMessage: 'Your Gmail connection has expired. Please reconnect your Gmail account.'
      });
    }
    
    if (error.message.includes('Daily sending quota exceeded')) {
      return res.status(429).json({ 
        error: 'quota_exceeded',
        message: 'Daily email sending limit reached',
        userMessage: 'You have reached your daily email sending limit. Please try again tomorrow.'
      });
    }
    
    res.status(500).json({ 
      error: 'send_failed',
      message: error.message,
      userMessage: 'Failed to send email. Please try again.'
    });
  }
});

// Send email using App Password (Simple method - fallback)
router.post('/send-simple', auth, async (req, res) => {
  try {
    const { recipientEmail, subject, content } = req.body;
    const senderId = req.user.userId;

    console.log('Sending simple email from user:', senderId, 'to:', recipientEmail);

    // Validate input
    if (!recipientEmail || !subject || !content) {
      return res.status(400).json({
        error: 'missing_fields',
        message: 'Recipient email, subject, and content are required',
        userMessage: 'Please fill in all required fields.'
      });
    }

    // Get sender details
    const sender = await sequelize.query(`
      SELECT firstName, lastName, email FROM Users WHERE id = ?
    `, {
      replacements: [senderId],
      type: sequelize.QueryTypes.SELECT
    });

    if (!sender[0]) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    // Check if app password is configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return res.status(500).json({
        error: 'email_not_configured',
        message: 'Email service is not configured on the server',
        userMessage: 'Email service is currently unavailable. Please try again later.'
      });
    }

    // Create transporter with app password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail
        pass: process.env.GMAIL_APP_PASSWORD // App password (not regular password)
      }
    });

    // Verify transporter
    await transporter.verify();

    // Send email
    const mailOptions = {
      from: `"${sender[0].firstName} ${sender[0].lastName} via ALU Platform" <${process.env.GMAIL_USER}>`,
      to: recipientEmail,
      subject: subject,
      replyTo: sender[0].email, // Allow recipients to reply directly to sender
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">ALU Platform</h1>
            <p style="color: white; margin: 5px 0;">Message via ALU Platform</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              <strong>From:</strong> ${sender[0].firstName} ${sender[0].lastName} (${sender[0].email})
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              <strong>Subject:</strong> ${subject}
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              ${content.replace(/\n/g, '<br>')}
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px;">
              This message was sent via ALU Platform. 
              <a href="mailto:${sender[0].email}" style="color: #667eea;">Reply directly to ${sender[0].firstName}</a>
            </p>
          </div>
          
          <div style="background: #333; padding: 15px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © 2025 ALU Platform. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
From: ${sender[0].firstName} ${sender[0].lastName} (${sender[0].email})
Subject: ${subject}

${content}

---
This message was sent via ALU Platform.
Reply directly to: ${sender[0].email}
      `
    };

    const result = await transporter.sendMail(mailOptions);

    // Save to database
    await sequelize.query(`
      INSERT INTO EmailMessages (senderId, recipientEmail, subject, content, status, sentAt, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, 'sent', NOW(), NOW(), NOW())
    `, {
      replacements: [senderId, recipientEmail, subject, content],
      type: sequelize.QueryTypes.INSERT
    });

    console.log(`Simple email sent successfully from ${sender[0].email} to ${recipientEmail}`);
    res.json({ 
      message: 'Email sent successfully',
      method: 'app_password',
      messageId: result.messageId,
      success: true
    });

  } catch (error) {
    console.error('Error sending simple email:', error);
    
    // Handle specific errors
    if (error.message.includes('Invalid login')) {
      return res.status(401).json({ 
        error: 'invalid_credentials',
        message: 'Gmail app password is invalid',
        userMessage: 'Email service authentication failed. Please contact the administrator.'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to send email',
      message: error.message,
      userMessage: 'Failed to send email. Please try again later.'
    });
  }
});

// Get sent emails for current user
router.get('/sent', auth, async (req, res) => {
  try {
    console.log('Fetching sent emails for user:', req.user.userId);
    
    const sentEmails = await sequelize.query(`
      SELECT id, recipientEmail, subject, content, status, sentAt
      FROM EmailMessages 
      WHERE senderId = ? 
      ORDER BY sentAt DESC
      LIMIT 50
    `, {
      replacements: [req.user.userId],
      type: sequelize.QueryTypes.SELECT
    });

    console.log(`Found ${sentEmails.length} sent emails for user:`, req.user.userId);
    res.json({ 
      emails: sentEmails,
      total: sentEmails.length 
    });
  } catch (error) {
    console.error('Get sent emails error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sent emails',
      message: error.message 
    });
  }
});

// Check Gmail connection status
router.get('/gmail/status', auth, async (req, res) => {
  try {
    const userTokens = await sequelize.query(`
      SELECT gmailAccessToken IS NOT NULL as isConnected 
      FROM Users 
      WHERE id = ?
    `, {
      replacements: [req.user.userId],
      type: sequelize.QueryTypes.SELECT
    });

    const isConnected = userTokens[0]?.isConnected || false;
    console.log('Gmail status for user', req.user.userId, ':', isConnected);
    
    res.json({ isConnected });
  } catch (error) {
    console.error('Gmail status error:', error);
    res.status(500).json({ 
      error: 'Failed to check Gmail status',
      message: error.message 
    });
  }
});

// Disconnect Gmail account
router.post('/gmail/disconnect', auth, async (req, res) => {
  try {
    console.log('Disconnecting Gmail for user:', req.user.userId);
    
    await sequelize.query(`
      UPDATE Users 
      SET gmailAccessToken = NULL, gmailRefreshToken = NULL, updatedAt = NOW()
      WHERE id = ?
    `, {
      replacements: [req.user.userId],
      type: sequelize.QueryTypes.UPDATE
    });

    console.log('Gmail disconnected successfully for user:', req.user.userId);
    res.json({ 
      message: 'Gmail disconnected successfully',
      success: true 
    });
  } catch (error) {
    console.error('Gmail disconnect error:', error);
    res.status(500).json({ 
      error: 'Failed to disconnect Gmail',
      message: error.message 
    });
  }
});

module.exports = router;