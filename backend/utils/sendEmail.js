const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter using standard SMTP configuration
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465, // true for 465, false for other ports like 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"DevPulse Blog" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message}</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Success: Email sent successfully to ${options.email} (ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`[SMTP] Error: Failed to send email to ${options.email}`);
    console.error(`[SMTP] Actual Error Details:`, error);
    
    // Fallback log for development/debugging
    console.log('-----------------------------------------');
    console.log(`FALLBACK EMAIL LOG (To: ${options.email})`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Content:\n${options.message}`);
    console.log('-----------------------------------------');
    return false;
  }
};

module.exports = sendEmail;
