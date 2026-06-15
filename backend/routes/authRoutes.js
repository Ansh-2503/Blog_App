const express = require('express');
const {
  register,
  verifyOtp,
  login,
  googleCallback,
  forgotPassword,
  resetPassword,
  getMe,
  refreshToken,
  logout,
  logoutAll,
  updateProfile,
  changePassword,
  uploadProfileImage,
  deleteProfileImage,
  testEmail,
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validation');
const { upload } = require('../utils/cloudinary');

const router = express.Router();

const rateLimit = require('express-rate-limit');

// Rate Limiter for auth routes (5 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, validate(schemas.register), register);
router.post('/verify-otp', authLimiter, validate(schemas.verifyOtp), verifyOtp);
router.post('/login', authLimiter, validate(schemas.login), login);
router.get('/google/callback', googleCallback); // Standard OAuth callback route
router.post('/forgot-password', authLimiter, validate(schemas.forgotPassword), forgotPassword);
router.post('/reset-password', authLimiter, validate(schemas.resetPassword), resetPassword);
router.post('/test-email', testEmail);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAll);
router.get('/me', protect, getMe);
router.put('/profile', protect, validate(schemas.updateProfile), updateProfile);
router.post('/change-password', protect, validate(schemas.changePassword), changePassword);
router.post('/profile-image', protect, upload.single('image'), uploadProfileImage);
router.delete('/profile-image', protect, deleteProfileImage);

module.exports = router;
