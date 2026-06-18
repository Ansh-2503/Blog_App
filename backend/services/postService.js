const Post = require('../models/Post');
const User = require('../models/User');
const PostView = require('../models/PostView');
const { cloudinary } = require('../utils/cloudinary');

const CATEGORIES = [
  { id: '1', name: 'JavaScript', slug: 'javascript', count: 145, description: 'Modern JavaScript patterns, frameworks, and ecosystem', color: 'yellow' },
  { id: '2', name: 'TypeScript', slug: 'typescript', count: 89, description: 'Type-safe programming with TypeScript', color: 'blue' },
  { id: '3', name: 'Rust', slug: 'rust', count: 67, description: 'Systems programming with Rust', color: 'orange' },
  { id: '4', name: 'Architecture', slug: 'architecture', count: 78, description: 'Software design patterns and system architecture', color: 'purple' },
  { id: '5', name: 'DevOps', slug: 'devops', count: 56, description: 'Infrastructure, CI/CD, and operational excellence', color: 'green' },
  { id: '6', name: 'AI / ML', slug: 'ai-ml', count: 134, description: 'Machine learning, LLMs, and AI engineering', color: 'pink' },
  { id: '7', name: 'Security', slug: 'security', count: 43, description: 'Application security, cryptography, and threat modeling', color: 'red' },
  { id: '8', name: 'Systems', slug: 'systems', count: 52, description: 'Operating systems, compilers, and low-level programming', color: 'gray' },
];

const formatAuthor = (user) => {
  if (!user) return {
    id: 'unknown',
    name: 'Anonymous',
    role: 'Contributor',
    company: 'DevPulse',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Anonymous',
    bio: 'Technical contributor at DevPulse.',
    followers: 0,
    articles: 0,
  };
  return {
    id: user._id,
    name: user.name,
    role: user.role === 'CREATOR' ? 'Staff Writer' : 'Contributor',
    company: 'DevPulse',
    avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
    bio: `${user.name} is a technical writer and contributor at DevPulse.`,
    followers: 154,
    articles: 8,
  };
};

const formatArticle = (post, user = null) => {
  const catObj = CATEGORIES.find(c => c.slug === post.category || c.id === post.category) || CATEGORIES[0];
  const postAuthor = post.authorId && post.authorId.name ? post.authorId : user;
  
  return {
    id: post._id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImage: post.coverImage || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=630&fit=crop&auto=format',
    category: catObj,
    author: formatAuthor(postAuthor),
    publishedAt: post.createdAt ? (typeof post.createdAt.toISOString === 'function' ? post.createdAt.toISOString().split('T')[0] : new Date(post.createdAt).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
    updatedAt: post.updatedAt ? (typeof post.updatedAt.toISOString === 'function' ? post.updatedAt.toISOString().split('T')[0] : new Date(post.updatedAt).toISOString().split('T')[0]) : undefined,
    readTime: Math.max(1, Math.round((post.htmlContent || '').split(/\s+/).filter(Boolean).length / 200)),
    views: post.views,
    likes: post.likes,
    status: post.status,
    tags: post.seoKeywords ? post.seoKeywords.split(',').map(s => s.trim()).filter(Boolean) : [],
    seoKeywords: post.seoKeywords || '',
  };
};

const generateSlug = async (title) => {
  let baseSlug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  let slug = baseSlug;
  let count = 1;

  while (await Post.findOne({ slug })) {
    slug = `${baseSlug}-${count}`;
    count++;
  }
  return slug;
};

exports.createPost = async ({ title, htmlContent, content, category, excerpt, coverImage, seoKeywords, status, authorId, userObj }) => {
  const postContent = htmlContent || content;
  if (!title || !postContent || !category || !excerpt) {
    throw Object.assign(new Error('Please provide title, content, category, and excerpt'), { statusCode: 400 });
  }

  const slug = await generateSlug(title);
  const post = new Post({
    title,
    slug,
    htmlContent: postContent,
    category,
    excerpt,
    coverImage,
    seoKeywords,
    status: status || 'draft',
    authorId,
  });

  await post.save();
  return formatArticle(post, userObj);
};

exports.getPosts = async ({ search, category, sort, status, author, user }) => {
  const query = {};

  if (user) {
    if (author && author === user._id.toString()) {
      query.authorId = user._id;
      if (status) query.status = status;
    } else {
      query.status = 'published';
      if (author) query.authorId = author;
    }
  } else {
    query.status = 'published';
    if (author) query.authorId = author;
  }

  if (category) {
    const matchedCat = CATEGORIES.find(c => c.slug === category.toLowerCase() || c.id === category);
    query.category = matchedCat ? matchedCat.slug : category;
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query.$or = [
      { title: searchRegex },
      { excerpt: searchRegex },
      { seoKeywords: searchRegex },
    ];
  }

  let sortBy = { createdAt: -1 };
  if (sort) {
    switch (sort) {
      case 'popular': sortBy = { views: -1 }; break;
      case 'trending': sortBy = { likes: -1, views: -1 }; break;
      case 'oldest': sortBy = { createdAt: 1 }; break;
      default: sortBy = { createdAt: -1 };
    }
  }

  // Performance optimization: prevent fetching full htmlContent for listings
  const posts = await Post.find(query).select('-htmlContent').populate('authorId').sort(sortBy);
  return posts.map(post => formatArticle(post));
};

exports.getPostBySlug = async ({ slug, user }) => {
  const post = await Post.findOne({ slug }).populate('authorId');

  if (!post) throw Object.assign(new Error('Post not found'), { statusCode: 404 });

  if (post.status !== 'published') {
    if (!user || user._id.toString() !== post.authorId._id.toString()) {
      throw Object.assign(new Error('Access Denied. This article is not published.'), { statusCode: 403 });
    }
  }

  return {
    data: formatArticle(post),
    htmlContent: post.htmlContent,
  };
};

exports.getPostById = async ({ id, userId }) => {
  const post = await Post.findById(id).populate('authorId');

  if (!post) throw Object.assign(new Error('Post not found'), { statusCode: 404 });

  if (post.authorId._id.toString() !== userId.toString()) {
    throw Object.assign(new Error('Not authorized to view this post details'), { statusCode: 403 });
  }

  return {
    id: post._id,
    title: post.title,
    excerpt: post.excerpt,
    content: post.htmlContent,
    category: post.category,
    coverImage: post.coverImage,
    seoKeywords: post.seoKeywords,
    status: post.status,
  };
};

exports.updatePost = async ({ id, userId, updateData }) => {
  const post = await Post.findById(id);

  if (!post) throw Object.assign(new Error('Post not found'), { statusCode: 404 });

  if (post.authorId.toString() !== userId.toString()) {
    throw Object.assign(new Error('Not authorized to update this article'), { statusCode: 403 });
  }

  const { title, htmlContent, content, category, excerpt, coverImage, seoKeywords, status } = updateData;
  const postContent = htmlContent || content;

  if (title && title !== post.title) {
    post.slug = await generateSlug(title);
    post.title = title;
  }

  if (postContent !== undefined) post.htmlContent = postContent;
  if (category !== undefined) post.category = category;
  if (excerpt !== undefined) post.excerpt = excerpt;
  if (coverImage !== undefined) post.coverImage = coverImage;
  if (seoKeywords !== undefined) post.seoKeywords = seoKeywords;
  if (status !== undefined) post.status = status;

  await post.save();
  return formatArticle(post);
};

exports.deletePost = async ({ id, userId }) => {
  const post = await Post.findById(id);

  if (!post) throw Object.assign(new Error('Post not found'), { statusCode: 404 });

  if (post.authorId.toString() !== userId.toString()) {
    throw Object.assign(new Error('Not authorized to delete this article'), { statusCode: 403 });
  }

  await Post.findByIdAndDelete(id);
  return true;
};

exports.toggleLike = async ({ id, action }) => {
  const post = await Post.findById(id);

  if (!post) throw Object.assign(new Error('Post not found'), { statusCode: 404 });

  if (action === 'unlike') {
    post.likes = Math.max(0, post.likes - 1);
  } else {
    post.likes += 1;
  }

  await post.save();
  return post.likes;
};

exports.uploadCoverImage = async (file) => {
  if (!file) throw Object.assign(new Error('Please upload an image file'), { statusCode: 400 });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'devpulse_covers', resource_type: 'image' },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    stream.end(file.buffer);
  });
};

exports.getCategories = async () => {
  const counts = await Post.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  const countMap = counts.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  return CATEGORIES.map(cat => ({
    ...cat,
    count: countMap[cat.slug] || countMap[cat.id] || 0
  }));
};

exports.recordView = async ({ postId, userId }) => {
  const post = await Post.findById(postId);
  if (!post) throw Object.assign(new Error('Post not found'), { statusCode: 404 });

  try {
    const existingView = await PostView.findOne({ userId, postId });
    if (existingView) return { views: post.views, message: 'View already recorded for this user' };

    await PostView.create({ userId, postId });
    post.views += 1;
    await post.save();

    return { views: post.views, message: 'View recorded successfully' };
  } catch (error) {
    if (error.code === 11000) {
      return { views: post.views, message: 'View already recorded for this user' };
    }
    throw error;
  }
};
