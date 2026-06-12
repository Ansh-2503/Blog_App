export interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
  description: string;
  color: string;
}

export interface Author {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  bio: string;
  followers: number;
  articles: number;
  twitter?: string;
  github?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: Category;
  author: Author;
  publishedAt: string;
  updatedAt?: string;
  readTime: number;
  views: number;
  likes: number;
  featured?: boolean;
  trending?: boolean;
  status: 'published' | 'draft' | 'scheduled';
  tags: string[];
  seoKeywords?: string;
}

export interface DashboardStats {
  totalViews: number;
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  scheduledArticles: number;
  totalFollowers: number;
  totalLikes: number;
  weeklyViews: number[];
  monthlyViews: number[];
}
