export const SITE_NAME = 'DevPulse';

export const ROUTES = {
  home: '/feed',
  blog: '/blog',
  blogDetail: (slug: string) => `/blog/${slug}`,
  search: '/search',
  category: (slug: string) => `/category/${slug}`,
  login: '/',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  accessDenied: '/403',
  dashboard: '/dashboard',
  analytics: '/dashboard/analytics',
  articles: '/dashboard/articles',
  newArticle: '/dashboard/articles/new',
  editArticle: (id: string) => `/dashboard/articles/${id}/edit`,
  previewArticle: (id: string) => `/dashboard/articles/${id}/preview`,
  profile: '/settings/profile',
  account: '/settings/account',
} as const;
