const { google } = require('googleapis');
const nodemailer = require('nodemailer');

class GmailService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  // Generate OAuth URL for user to authenticate
  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Exchange authorization code for tokens
  async getTokens(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  // Send email using user's Gmail account
  async sendEmail(accessToken, refreshToken, emailData) {
    try {
      // Set credentials
      this.oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      // Create transporter
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: emailData.from,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          refreshToken: refreshToken,
          accessToken: accessToken
        }
      });

      // Send email
      const result = await transporter.sendMail({
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      });

      return result;
    } catch (error) {
      console.error('Gmail send error:', error);
      throw error;
    }
  }

  // Refresh access token if expired
  async refreshAccessToken(refreshToken) {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials.access_token;
  }
}

module.exports = new GmailService();