const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Please provide a slug'],
      unique: true,
      index: true,
    },
    htmlContent: {
      type: String,
      required: [true, 'Please provide content'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
    },
    coverImage: {
      type: String,
      default: '',
    },
    excerpt: {
      type: String,
      required: [true, 'Please provide an excerpt/summary'],
    },
    seoKeywords: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled'],
      default: 'draft',
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post must belong to an author'],
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Post', postSchema);
