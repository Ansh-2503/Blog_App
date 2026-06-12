const express = require('express');
const {
  createPost,
  getPosts,
  getPostBySlug,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  uploadCoverImage,
  getCategories,
  recordView,
} = require('../controllers/postController');
const { protect, checkRole, optionalProtect } = require('../middlewares/auth');
const { upload } = require('../utils/cloudinary');
const { validate, schemas } = require('../middlewares/validation');

const router = express.Router();

// Public routes with optional auth detection
router.get('/categories', getCategories);
router.get('/', optionalProtect, getPosts);
router.get('/slug/:slug', optionalProtect, getPostBySlug);

// Private/Protected routes
router.post('/:id/like', protect, toggleLike);
router.patch('/:id/view', protect, recordView);

// Creator only routes
router.post('/', protect, checkRole('CREATOR'), validate(schemas.createPost), createPost);
router.post(
  '/upload-cover',
  protect,
  checkRole('CREATOR'),
  upload.single('image'),
  uploadCoverImage
);
router.get('/:id', protect, checkRole('CREATOR'), getPostById);
router.put('/:id', protect, checkRole('CREATOR'), validate(schemas.updatePost), updatePost);
router.delete('/:id', protect, checkRole('CREATOR'), deletePost);

module.exports = router;
