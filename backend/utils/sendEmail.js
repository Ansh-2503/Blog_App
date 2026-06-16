/**
 * Email sending utility using Nodemailer
 * Replaces Resend API to ensure reliable SMTP delivery across environments.
 */

const nodemailer = require("nodemailer");

// Create a reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendOtpEmail = async (email, otp) => {
  console.log(`[OTP_START] Initiating Nodemailer delivery to ${email}`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("CRITICAL ERROR: EMAIL_USER or EMAIL_PASS is not defined in environment variables.");
  }

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"DevPulse" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "DevPulse Account Verification",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2563eb;">Welcome to DevPulse!</h2>
          <p>Thank you for signing up. Please verify your email using the verification code below:</p>
          <div style="font-size: 32px; font-weight: bold; color: #1e3a8a; padding: 15px; background-color: #f3f4f6; text-align: center; border-radius: 6px; letter-spacing: 4px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 13px; color: #666;">This code will expire in 5 minutes.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[OTP_SUCCESS] Verification email successfully delivered to ${email}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[OTP_FAILURE] Error sending email to ${email}:`, error);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

const sendResetEmail = async (email, resetUrl) => {
  console.log(`[RESET_START] Initiating reset Nodemailer delivery to ${email}`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("CRITICAL ERROR: EMAIL_USER or EMAIL_PASS is not defined in environment variables.");
  }

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"DevPulse" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "DevPulse Password Reset",
      html: `<div style="padding: 20px;"><h2>DevPulse Password Reset</h2><p>You requested a password reset. Click the link below:</p><a href="${resetUrl}">Reset Password</a></div>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[RESET_SUCCESS] Password reset email successfully delivered to ${email}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[RESET_FAILURE] Error sending reset email to ${email}:`, error);
    throw new Error(`Failed to send reset email: ${error.message}`);
  }
};

module.exports = { sendOtpEmail, sendResetEmail };
