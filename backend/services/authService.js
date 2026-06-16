const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const OTP = require("../models/OTP");
const { sendOtpEmail, sendResetEmail } = require("../utils/sendEmail");
const { cloudinary } = require("../utils/cloudinary");

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.CLIENT_URL || "http://localhost:3000",
);

const signAccessToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

exports.registerUser = async ({ name, email, password, role }) => {
  let user = await User.findOne({ email });

  if (user) {
    if (user.isVerified) {
      throw Object.assign(new Error("Email already registered. Please login instead."), { statusCode: 400 });
    }
    user.name = name;
    user.passwordHash = await bcrypt.hash(password, 10);
    if (role) user.role = role;
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email,
      passwordHash,
      role: role || "VISITOR",
      isVerified: false,
    });
  }

  await user.save();

  const latestOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });
  if (latestOtp) {
    const timeSinceLastOtp = Date.now() - latestOtp.createdAt.getTime();
    if (timeSinceLastOtp < 60 * 1000) {
      throw Object.assign(new Error(`Please wait ${Math.ceil((60000 - timeSinceLastOtp) / 1000)} seconds before requesting a new code.`), { statusCode: 429 });
    }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);
  
  await OTP.deleteMany({ email });
  await OTP.create({
    email,
    code: hashedOtp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  // Handle DEMO_MODE
  if (process.env.DEMO_MODE === "true") {
    console.log(`[DEMO_MODE] OTP for ${email}: ${otp}`);
    return { email: user.email, otp };
  }

  // Blocking email send
  try {
    await sendOtpEmail(user.email, otp);
  } catch (error) {
    throw Object.assign(new Error(error.message || "Failed to send verification email. Please try again later."), { statusCode: 500 });
  }

  return { email: user.email };
};

exports.verifyOtp = async ({ email, otp }) => {
  const user = await User.findOne({ email });

  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 400 });
  if (user.isVerified) throw Object.assign(new Error("Account already verified. Please login."), { statusCode: 400 });

  const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });
  if (!otpRecord) throw Object.assign(new Error("Verification code not found or expired. Please request a new one."), { statusCode: 400 });
  
  const isMatch = await bcrypt.compare(otp.toString(), otpRecord.code);
  if (!isMatch) throw Object.assign(new Error("Invalid verification code"), { statusCode: 400 });
  
  if (otpRecord.expiresAt < new Date()) throw Object.assign(new Error("Verification code has expired. Please register again."), { statusCode: 400 });

  user.isVerified = true;
  await user.save();
  await OTP.deleteMany({ email });

  const token = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id);
  user.refreshTokens.push(refreshToken);
  await user.save();

  return { user, token, refreshToken };
};

exports.resendOtp = async ({ email }) => {
  const user = await User.findOne({ email });

  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 400 });
  if (user.isVerified) throw Object.assign(new Error("Account already verified. Please login."), { statusCode: 400 });

  const latestOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });
  if (latestOtp) {
    const timeSinceLastOtp = Date.now() - latestOtp.createdAt.getTime();
    if (timeSinceLastOtp < 60 * 1000) {
      throw Object.assign(new Error(`Please wait ${Math.ceil((60000 - timeSinceLastOtp) / 1000)} seconds before requesting a new code.`), { statusCode: 429 });
    }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  await OTP.deleteMany({ email });
  await OTP.create({
    email,
    code: hashedOtp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  console.log(`[OTP] Generated new OTP for ${email}`);

  // Handle DEMO_MODE
  if (process.env.DEMO_MODE === "true") {
    console.log(`[DEMO_MODE] OTP for ${email}: ${otp}`);
    return { otp };
  }

  // Blocking email send
  try {
    await sendOtpEmail(user.email, otp);
  } catch (error) {
    throw Object.assign(new Error(error.message || "Failed to resend verification email. Please try again later."), { statusCode: 500 });
  }

  return true;
};

exports.loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user || !user.passwordHash) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
  if (!user.isVerified) throw Object.assign(new Error("Email not verified. Please sign up again to verify."), { statusCode: 401 });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

  const token = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id);
  user.refreshTokens.push(refreshToken);
  await user.save();

  return { user, token, refreshToken };
};

exports.processGoogleCallback = async ({ code, state }) => {
  let parsedState = {};
  if (state && state !== 'google') {
    try {
      parsedState = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    } catch (e) {}
  }

  const redirect_uri = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/google/callback`;
  const { tokens } = await googleClient.getToken({ code, redirect_uri });

  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { email, name, picture } = ticket.getPayload();
  let user = await User.findOne({ email });
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    user = new User({
      name: parsedState.name || name,
      email,
      isVerified: true,
      role: parsedState.role || "VISITOR",
      provider: "google",
      avatar: picture || null,
      googleAvatar: picture || null,
    });
    await user.save();
  } else {
    if (!user.isVerified) user.isVerified = true;
    user.provider = "google";
    if (picture) user.googleAvatar = picture;
    if (picture && !user.avatar) user.avatar = picture;
    await user.save();
  }

  const token = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id);
  user.refreshTokens.push(refreshToken);
  await user.save();

  return { user, token, refreshToken, isNewUser };
};

exports.forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) return true; // Pretend it worked for security

  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
  // Blocking email send
  try {
    await sendResetEmail(user.email, resetUrl);
  } catch (error) {
    throw Object.assign(new Error(error.message || "Failed to send reset email. Please try again later."), { statusCode: 500 });
  }
  return true;
};

exports.resetPassword = async ({ token, password }) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetToken: hashedToken,
    resetTokenExpires: { $gt: Date.now() },
  });

  if (!user) throw Object.assign(new Error("Invalid or expired password reset token"), { statusCode: 400 });

  user.passwordHash = await bcrypt.hash(password, 10);
  user.resetToken = null;
  user.resetTokenExpires = null;
  user.refreshTokens = [];
  await user.save();
};

exports.refreshAccessToken = async ({ refreshToken }) => {
  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || !user.refreshTokens.includes(refreshToken)) {
    throw new Error("Invalid refresh token");
  }

  const token = signAccessToken(user._id, user.role);
  return { token };
};

exports.changePassword = async (userId, { currentPassword, newPassword, confirmPassword }) => {
  if (newPassword !== confirmPassword) {
    throw Object.assign(new Error("Passwords do not match"), { statusCode: 400 });
  }

  const user = await User.findById(userId);
  if (!user.passwordHash) {
    throw Object.assign(new Error("No password set. Use forgot password."), { statusCode: 400 });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) throw Object.assign(new Error("Incorrect current password"), { statusCode: 400 });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.refreshTokens = [];
  await user.save();
};

exports.uploadProfileImage = async (userId, file) => {
  if (!file) throw Object.assign(new Error("Please upload an image file"), { statusCode: 400 });

  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

  // Delete existing custom avatar from Cloudinary if it exists (run in background)
  if (user.avatarId) {
    cloudinary.uploader.destroy(user.avatarId).catch(err => {
      console.error("Failed to delete old avatar from Cloudinary:", err);
    });
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "devpulse_profiles", resource_type: "image" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(file.buffer);
  });

  user.avatar = result.secure_url;
  user.avatarId = result.public_id;
  await user.save();

  return { avatar: user.avatar };
};

exports.deleteProfileImage = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

  if (user.avatarId) {
    // Run deletion in background so user doesn't wait
    cloudinary.uploader.destroy(user.avatarId).catch(err => {
      console.error("Failed to delete avatar from Cloudinary:", err);
    });
  }

  user.avatar = user.googleAvatar || null;
  user.avatarId = null;
  await user.save();

  return { avatar: user.avatar };
};
