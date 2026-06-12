const mongoose = require('mongoose');

const postViewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user ID'],
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Please provide a post ID'],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only have one view per post
postViewSchema.index({ userId: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model('PostView', postViewSchema);
