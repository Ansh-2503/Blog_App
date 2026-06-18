import type { Article, Author, Category, DashboardStats } from '@/types';

export type { Article, Author, Category, DashboardStats };

export const CATEGORIES: Category[] = [
  { id: '1', name: 'JavaScript', slug: 'javascript', count: 145, description: 'Modern JavaScript patterns, frameworks, and ecosystem', color: 'yellow' },
  { id: '2', name: 'TypeScript', slug: 'typescript', count: 89, description: 'Type-safe programming with TypeScript', color: 'blue' },
  { id: '3', name: 'Rust', slug: 'rust', count: 67, description: 'Systems programming with Rust', color: 'orange' },
  { id: '4', name: 'Architecture', slug: 'architecture', count: 78, description: 'Software design patterns and system architecture', color: 'purple' },
  { id: '5', name: 'DevOps', slug: 'devops', count: 56, description: 'Infrastructure, CI/CD, and operational excellence', color: 'green' },
  { id: '6', name: 'AI / ML', slug: 'ai-ml', count: 134, description: 'Machine learning, LLMs, and AI engineering', color: 'pink' },
  { id: '7', name: 'Security', slug: 'security', count: 43, description: 'Application security, cryptography, and threat modeling', color: 'red' },
  { id: '8', name: 'Systems', slug: 'systems', count: 52, description: 'Operating systems, compilers, and low-level programming', color: 'gray' },
];

export const AUTHORS: Author[] = [];

export const ARTICLES: Article[] = [];

export const ARTICLE_CONTENT = '';

export const DASHBOARD_STATS: DashboardStats = {
  totalViews: 0,
  totalArticles: 0,
  publishedArticles: 0,
  draftArticles: 0,
  scheduledArticles: 0,
  totalFollowers: 0,
  totalLikes: 0,
  weeklyViews: [0, 0, 0, 0, 0, 0, 0],
  monthlyViews: [0, 0, 0, 0, 0, 0],
};
