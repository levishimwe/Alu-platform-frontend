// === backend/services/emailService.js ===
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({  // Fixed: removed 'er'
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmail = async ({ to, subject, html }) => {
  return transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
};

// Add this missing function
exports.sendVerificationEmail = async (user) => {
  try {
    console.log(`📧 Sending verification email to: ${user.email}`);
    
    // For now, just log instead of actually sending
    // TODO: Generate actual verification token and send email
    console.log(`✅ Verification email would be sent to ${user.email}`);
    
    /* 
    // When you want to actually send emails, uncomment this:
    const verificationToken = generateVerificationToken(user.id);
    const html = `
      <h1>Verify Your Email</h1>
      <p>Click the link below to verify your email:</p>
      <a href="${process.env.FRONTEND_URL}/verify-email/${verificationToken}">Verify Email</a>
    `;
    
    await exports.sendEmail({
      to: user.email,
      subject: "Verify Your Email",
      html: html
    });
    */
    
    return Promise.resolve();
  } catch (error) {
    console.error("❌ Email service error:", error);
    // Don't throw the error - just log it so registration can continue
    return Promise.resolve();
  }
};