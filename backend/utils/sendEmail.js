const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const smtpConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };

  // Log configuration (excluding password) to verify ENV variables in production
  console.log(`[SMTP] Initializing transporter with Config: Host=${smtpConfig.host}, Port=${smtpConfig.port}, Secure=${smtpConfig.secure}, User=${smtpConfig.auth.user ? 'SET' : 'MISSING'}, Pass=${smtpConfig.auth.pass ? 'SET' : 'MISSING'}`);

  const transporter = nodemailer.createTransport(smtpConfig);

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
    console.error(`[SMTP] Error Name: ${error.name}`);
    console.error(`[SMTP] Error Message: ${error.message}`);
    console.error(`[SMTP] Full Error Stack:`, error.stack);
    
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
