const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter using Gmail SMTP or similar (based on .env)
  // Note: For Gmail, service: 'gmail' or host: 'smtp.gmail.com' is used.
  const transporter = nodemailer.createTransport({
    service: 'gmail',
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
    console.log(`Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Nodemailer error sending email:', error.message);
    console.log('-----------------------------------------');
    console.log(`FALLBACK EMAIL LOG (To: ${options.email})`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Content:\n${options.message}`);
    console.log('-----------------------------------------');
    return false;
  }
};

module.exports = sendEmail;
