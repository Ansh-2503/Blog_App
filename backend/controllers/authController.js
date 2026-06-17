const authService = require("../services/authService");

const sendTokenResponse = (req, res, statusCode, { user, token, refreshToken }) => {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === "production";
  const sameSiteOption = isSecure ? "none" : "lax";

  const cookieOptions = {
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    httpOnly: false,
    secure: isSecure,
    sameSite: sameSiteOption,
  };

  const refreshCookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: isSecure,
    sameSite: sameSiteOption,
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
    if (result.otp) {
      res.status(200).json({ success: true, message: "OTP generated (demo mode - production fallback)", email: result.email, otp: result.otp });
    } else {
      res.status(200).json({ success: true, message: "Verification OTP sent to email", email: result.email });
    }
  } catch (error) {
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: "Please provide email and verification code" });
    
    const data = await authService.verifyOtp({ email, otp });
    sendTokenResponse(req, res, 200, data);
  } catch (error) {
    next(error);
  }
};

exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Please provide an email address" });

    const result = await authService.resendOtp({ email });
    if (result && result.otp) {
      res.status(200).json({ success: true, message: "OTP generated (demo mode - production fallback)", otp: result.otp });
    } else {
      res.status(200).json({ success: true, message: "A new verification code has been sent to your email." });
    }
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Please provide email and password" });

    const data = await authService.loginUser({ email, password });
    sendTokenResponse(req, res, 200, data);
  } catch (error) {
    next(error);
  }
};

exports.googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

    console.log("[Google OAuth Callback] Starting Google callback handling");
    console.log(`[Google OAuth Callback] Request Query parameters: code=${code ? 'PRESENT' : 'MISSING'}, state=${state || 'none'}`);

    if (!code) {
      console.warn("[Google OAuth Callback] No code provided by Google redirect.");
      return res.redirect(`${clientUrl}/?error=NoCodeProvided`);
    }

    // Determine the redirect URI dynamically to match the client callback path
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const redirect_uri = `${protocol}://${host}${req.baseUrl}${req.path}`;
    console.log(`[Google OAuth Callback] Dynamically computed redirect_uri: ${redirect_uri}`);

    console.log("[Google OAuth Callback] Initiating token exchange and user verification");
    const { user, token, refreshToken, isNewUser } = await authService.processGoogleCallback({ code, state, redirect_uri });
    
    console.log(`[Google OAuth Callback] Success: Authenticated user ${user.email} (New: ${isNewUser})`);
    
    // Set cookies on backend domain (required for refresh token to work later)
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === "production";
    const sameSiteOption = isSecure ? "none" : "lax";
    console.log(`[Google OAuth Callback] Setting backend cookies -> Secure: ${isSecure}, SameSite: ${sameSiteOption}`);

    res.cookie("token", token, { 
      expires: new Date(Date.now() + 15 * 60 * 1000), 
      httpOnly: false, 
      secure: isSecure, 
      sameSite: sameSiteOption 
    });

    res.cookie("refreshToken", refreshToken, { 
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
      httpOnly: true, 
      secure: isSecure, 
      sameSite: sameSiteOption 
    });

    // Cross-domain OAuth requires passing the token to the frontend so it can set cookies on its own domain
    const redirectUrl = isNewUser 
      ? `${clientUrl}/auth/callback?token=${token}&isNewUser=true`
      : `${clientUrl}/auth/callback?token=${token}`;

    console.log(`[Google OAuth Callback] Redirecting client to: ${redirectUrl.replace(/token=[^&]+/, 'token=REDACTED')}`);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("[Google OAuth Callback] CRITICAL ERROR occurred:", error);
    const errorMessage = encodeURIComponent(error.message || 'Unknown Error');
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    res.redirect(`${clientUrl}/?error=GoogleAuthFailed&details=${errorMessage}`);
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
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === "production";
    const sameSiteOption = isSecure ? "none" : "lax";

    res.status(200).cookie("token", token, { 
      expires: new Date(Date.now() + 15 * 60 * 1000), 
      httpOnly: false, 
      secure: isSecure, 
      sameSite: sameSiteOption 
    }).json({ success: true, token });
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
