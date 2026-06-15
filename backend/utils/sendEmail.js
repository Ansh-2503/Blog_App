const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log(`[SMTP Debug] Starting email send to: ${options.email}`);
  console.log(`[SMTP Debug] ENV Check: HOST=${process.env.SMTP_HOST}, PORT=${process.env.SMTP_PORT}, USER=${process.env.EMAIL_USER ? 'SET' : 'NOT_SET'}, PASS=${process.env.EMAIL_PASS ? 'SET' : 'NOT_SET'}`);

  // Create a transporter using standard SMTP configuration
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465, // true for 465, false for other ports like 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Adding extra debug/logger config to transporter for detailed output
    debug: true,
    logger: true
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
    console.error(`[SMTP Debug] Error caught in sendEmail try-catch!`);
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
