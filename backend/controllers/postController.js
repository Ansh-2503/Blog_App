const postService = require('../services/postService');

exports.createPost = async (req, res, next) => {
  try {
    const data = await postService.createPost({
      ...req.body,
      authorId: req.user._id,
      userObj: req.user,
    });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getPosts = async (req, res, next) => {
  try {
    const { search, category, sort, status, author } = req.query;
    const posts = await postService.getPosts({ search, category, sort, status, author, user: req.user });
    
    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPostBySlug = async (req, res, next) => {
  try {
    const data = await postService.getPostBySlug({ slug: req.params.slug, user: req.user });
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPostById = async (req, res, next) => {
  try {
    const data = await postService.getPostById({ id: req.params.id, userId: req.user._id });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const data = await postService.updatePost({ id: req.params.id, userId: req.user._id, updateData: req.body });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    await postService.deletePost({ id: req.params.id, userId: req.user._id });
    res.status(200).json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const likes = await postService.toggleLike({ id: req.params.id, action: req.body.action });
    res.status(200).json({ success: true, likes });
  } catch (error) {
    next(error);
  }
};

exports.uploadCoverImage = async (req, res, next) => {
  try {
    const url = await postService.uploadCoverImage(req.file);
    res.status(200).json({ success: true, url });
  } catch (error) {
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const data = await postService.getCategories();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.recordView = async (req, res, next) => {
  try {
    const data = await postService.recordView({ postId: req.params.id, userId: req.user._id });
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};
