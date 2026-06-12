const { z } = require('zod');

// Middleware factory for validating request bodies
exports.validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: error.errors.map(e => e.message).join(', '),
        });
      }
      next(error);
    }
  };
};

// Define Schemas
exports.schemas = {
  register: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(['VISITOR', 'CREATOR']).optional(),
  }),
  verifyOtp: z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
  }),
  login: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
  forgotPassword: z.object({
    email: z.string().email("Invalid email address"),
  }),
  resetPassword: z.object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
  changePassword: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
  updateProfile: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters").optional(),
    username: z.string().min(3, "Username must be at least 3 characters").max(30).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores").optional(),
    bio: z.string().max(300, "Bio must be at most 300 characters").optional(),
  }),
  createPost: z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    htmlContent: z.string().optional(),
    content: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
    coverImage: z.string().url("Must be a valid URL").optional().or(z.literal('')),
    seoKeywords: z.string().optional(),
    status: z.enum(['draft', 'published']).optional(),
  }).refine(data => data.htmlContent || data.content, {
    message: "Content is required",
    path: ["content"]
  }),
  updatePost: z.object({
    title: z.string().min(5, "Title must be at least 5 characters").optional(),
    htmlContent: z.string().optional(),
    content: z.string().optional(),
    category: z.string().min(1, "Category is required").optional(),
    excerpt: z.string().min(10, "Excerpt must be at least 10 characters").optional(),
    coverImage: z.string().url("Must be a valid URL").optional().or(z.literal('')),
    seoKeywords: z.string().optional(),
    status: z.enum(['draft', 'published']).optional(),
  }),
};
