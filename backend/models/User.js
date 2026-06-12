const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [300, 'Bio cannot be more than 300 characters'],
      default: '',
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: false, // Optional for pure OAuth (Google) logins
    },
    role: {
      type: String,
      enum: ['VISITOR', 'CREATOR'],
      default: 'VISITOR',
    },
    isVerified: {
      type: Boolean,
      default: false, // Used for OTP-based email verification on signup
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpires: {
      type: Date,
      default: null,
    },
    refreshTokens: {
      type: [String],
      default: [],
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    avatar: {
      type: String,
      default: null,
    },
    avatarId: {
      type: String,
      default: null,
    },
    googleAvatar: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
