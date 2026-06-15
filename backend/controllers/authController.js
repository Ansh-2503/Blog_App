const authService = require("../services/authService");

const sendTokenResponse = (res, statusCode, { user, token, refreshToken }) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  const refreshCookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .cookie("refreshToken", refreshToken, refreshCookieOptions)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        bio: user.bio,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
      },
    });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide name, email, and password" });
    }
    const result = await authService.registerUser({ name, email, password, role });
    res.status(200).json({ success: true, message: "Verification OTP sent to email", email: result.email });
  } catch (error) {
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: "Please provide email and verification code" });
    
    const data = await authService.verifyOtp({ email, otp });
    sendTokenResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Please provide email and password" });

    const data = await authService.loginUser({ email, password });
    sendTokenResponse(res, 200, data);
  } catch (error) {
    next(error);
  }
};

exports.googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL || "http://localhost:3000"}/?error=NoCodeProvided`);
    }

    const { user, token, refreshToken, isNewUser } = await authService.processGoogleCallback({ code, state });
    
    res.cookie("token", token, { expires: new Date(Date.now() + 15 * 60 * 1000), httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax" });
    res.cookie("refreshToken", refreshToken, { expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax" });

    if (isNewUser) {
      res.redirect(`${process.env.CLIENT_URL || "http://localhost:3000"}/complete-profile`);
    } else {
      res.redirect(`${process.env.CLIENT_URL || "http://localhost:3000"}/feed`);
    }
  } catch (error) {
    console.error(error);
    res.redirect(`${process.env.CLIENT_URL || "http://localhost:3000"}/?error=GoogleAuthFailed`);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Please provide an email address" });

    await authService.forgotPassword({ email });
    res.status(200).json({ success: true, message: "If the email exists, a password reset link has been sent." });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, message: "Token and new password are required" });

    await authService.resetPassword({ token, password });
    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      username: req.user.username,
      bio: req.user.bio,
      email: req.user.email,
      role: req.user.role,
      isVerified: req.user.isVerified,
      avatar: req.user.avatar,
    },
  });
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ success: false, message: "No refresh token provided" });

    const { token } = await authService.refreshAccessToken({ refreshToken });
    res.status(200).cookie("token", token, { expires: new Date(Date.now() + 15 * 60 * 1000), httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax" }).json({ success: true, token });
  } catch (error) {
    console.error("Refresh token error:", error.message);
    res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
  }
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (req.user && refreshToken) {
    req.user.refreshTokens = req.user.refreshTokens.filter((rt) => rt !== refreshToken);
    await req.user.save();
  }

  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

exports.logoutAll = async (req, res) => {
  if (req.user) {
    req.user.refreshTokens = [];
    await req.user.save();
  }

  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.status(200).json({ success: true, message: "Logged out from all devices successfully" });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, role, username, bio } = req.body;
    if (name) req.user.name = name;
    if (role) req.user.role = role;
    if (username) req.user.username = username;
    if (bio !== undefined) req.user.bio = bio;
    await req.user.save();
    
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        username: req.user.username,
        bio: req.user.bio,
        email: req.user.email,
        role: req.user.role,
        isVerified: req.user.isVerified,
        avatar: req.user.avatar,
      },
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.username) {
      return res.status(400).json({ success: false, message: "Username is already taken" });
    }
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Please provide all password fields" });
    }

    await authService.changePassword(req.user._id, { currentPassword, newPassword, confirmPassword });
    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

exports.uploadProfileImage = async (req, res, next) => {
  try {
    const data = await authService.uploadProfileImage(req.user._id, req.file);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.deleteProfileImage = async (req, res, next) => {
  try {
    const data = await authService.deleteProfileImage(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.testEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Please provide an email address to test" });

    const sendEmail = require("../utils/sendEmail");
    const emailSent = await sendEmail({
      email,
      subject: "DevPulse Test Email",
      message: "This is a test email to verify SMTP configuration.",
      html: "<p>This is a test email to verify SMTP configuration.</p>"
    });

    if (emailSent) {
      res.status(200).json({ success: true, message: "Test email sent successfully!" });
    } else {
      res.status(500).json({ success: false, message: "Failed to send test email. Check server logs." });
    }
  } catch (error) {
    next(error);
  }
};
