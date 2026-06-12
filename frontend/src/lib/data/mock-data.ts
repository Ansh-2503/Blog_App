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

export const AUTHORS: Author[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Systems Engineer',
    company: 'Cloudflare',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format',
    bio: 'Building distributed systems and edge infrastructure. Previously at AWS and Meta. Passionate about correctness, performance, and developer experience.',
    followers: 3420,
    articles: 28,
    twitter: 'schen_dev',
    github: 'sarahchen',
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    role: 'Staff Engineer',
    company: 'Stripe',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format',
    bio: 'Staff engineer at Stripe working on payment infrastructure and API design. Author of "Reliable Software" and open-source maintainer.',
    followers: 8910,
    articles: 45,
    twitter: 'mrodriguez_eng',
    github: 'marcusrod',
  },
  {
    id: '3',
    name: 'Aiko Tanaka',
    role: 'Senior Software Engineer',
    company: 'Google',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format',
    bio: 'Working on Google\'s ML infrastructure and TensorFlow. PhD in Computer Science from CMU. Speaker at GopherCon and KubeCon.',
    followers: 5670,
    articles: 31,
    twitter: 'aiko_builds',
    github: 'aikotanaka',
  },
  {
    id: '4',
    name: 'Dev Kumar',
    role: 'Principal Engineer',
    company: 'Netflix',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&auto=format',
    bio: 'Principal engineer at Netflix focused on streaming reliability and CDN optimization. 15+ years building high-scale systems.',
    followers: 12300,
    articles: 67,
    twitter: 'devkumar_tech',
    github: 'devkumar',
  },
];

export const ARTICLES: Article[] = [
  {
    id: '1',
    slug: 'building-type-safe-apis-typescript-zod',
    title: 'Building Type-Safe APIs with TypeScript and Zod',
    excerpt: 'Learn how to leverage TypeScript and Zod to build robust, fully type-safe API layers with runtime validation that catches errors before they reach production.',
    coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=630&fit=crop&auto=format',
    category: CATEGORIES[1],
    author: AUTHORS[0],
    publishedAt: '2024-05-28',
    readTime: 12,
    views: 8420,
    likes: 342,
    featured: true,
    trending: true,
    status: 'published',
    tags: ['TypeScript', 'API', 'Zod', 'Validation'],
  },
  {
    id: '2',
    slug: 'understanding-rusts-ownership-model',
    title: "Understanding Rust's Ownership Model Through Real Examples",
    excerpt: 'A deep dive into Rust\'s ownership, borrowing, and lifetime system — the concepts that make Rust memory-safe without a garbage collector.',
    coverImage: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&h=630&fit=crop&auto=format',
    category: CATEGORIES[2],
    author: AUTHORS[3],
    publishedAt: '2024-05-24',
    readTime: 18,
    views: 6830,
    likes: 289,
    trending: true,
    status: 'published',
    tags: ['Rust', 'Memory Safety', 'Systems'],
  },
  {
    id: '3',
    slug: 'designing-distributed-systems-at-scale',
    title: 'Designing Distributed Systems at Scale: Lessons from Production',
    excerpt: 'Hard-won insights from running distributed systems serving millions of requests per second — CAP theorem, eventual consistency, and resilience patterns.',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=630&fit=crop&auto=format',
    category: CATEGORIES[3],
    author: AUTHORS[1],
    publishedAt: '2024-05-20',
    readTime: 22,
    views: 11240,
    likes: 512,
    featured: true,
    status: 'published',
    tags: ['Distributed Systems', 'Architecture', 'Scale'],
  },
  {
    id: '4',
    slug: 'llm-engineering-production-patterns',
    title: 'LLM Engineering: Production Patterns for AI-Powered Applications',
    excerpt: 'Practical patterns for integrating large language models into production applications — prompt engineering, evaluation, guardrails, and cost optimization.',
    coverImage: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&h=630&fit=crop&auto=format',
    category: CATEGORIES[5],
    author: AUTHORS[2],
    publishedAt: '2024-05-18',
    readTime: 15,
    views: 14680,
    likes: 678,
    featured: true,
    trending: true,
    status: 'published',
    tags: ['AI', 'LLM', 'Production', 'Prompt Engineering'],
  },
  {
    id: '5',
    slug: 'kubernetes-security-hardening',
    title: 'Kubernetes Security Hardening: A Practical Guide',
    excerpt: 'Secure your Kubernetes clusters from the ground up — RBAC, network policies, pod security, secrets management, and runtime threat detection.',
    coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=630&fit=crop&auto=format',
    category: CATEGORIES[6],
    author: AUTHORS[0],
    publishedAt: '2024-05-14',
    readTime: 20,
    views: 5920,
    likes: 213,
    status: 'published',
    tags: ['Kubernetes', 'Security', 'DevOps', 'K8s'],
  },
  {
    id: '6',
    slug: 'monolith-to-microservices-migration',
    title: 'From Monolith to Microservices: A Practical Migration Guide',
    excerpt: 'How to systematically decompose a monolithic application into microservices without causing chaos — strangler fig pattern, bounded contexts, and incremental migration.',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=630&fit=crop&auto=format',
    category: CATEGORIES[3],
    author: AUTHORS[3],
    publishedAt: '2024-05-10',
    readTime: 16,
    views: 9150,
    likes: 387,
    trending: true,
    status: 'published',
    tags: ['Architecture', 'Microservices', 'Migration'],
  },
  {
    id: '7',
    slug: 'react-server-components-deep-dive',
    title: 'React Server Components: A Complete Deep Dive',
    excerpt: 'Everything you need to know about React Server Components — how they work, when to use them, and how they change the mental model for building React apps.',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=630&fit=crop&auto=format',
    category: CATEGORIES[0],
    author: AUTHORS[2],
    publishedAt: '2024-05-06',
    readTime: 14,
    views: 7340,
    likes: 298,
    status: 'published',
    tags: ['React', 'JavaScript', 'Server Components'],
  },
  {
    id: '8',
    slug: 'advanced-postgresql-performance',
    title: 'Advanced PostgreSQL Performance Tuning',
    excerpt: 'Query optimization, index strategies, connection pooling, vacuuming, and configuration tuning for high-performance PostgreSQL deployments.',
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&h=630&fit=crop&auto=format',
    category: CATEGORIES[7],
    author: AUTHORS[1],
    publishedAt: '2024-05-02',
    readTime: 19,
    views: 6210,
    likes: 241,
    status: 'published',
    tags: ['PostgreSQL', 'Database', 'Performance'],
  },
  {
    id: '9',
    slug: 'go-concurrency-patterns',
    title: 'Go Concurrency Patterns for High-Throughput Systems',
    excerpt: 'Goroutines, channels, worker pools, and pipeline patterns for building concurrent Go programs that scale efficiently under load.',
    coverImage: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=450&fit=crop&auto=format',
    category: CATEGORIES[7],
    author: AUTHORS[0],
    publishedAt: '2024-04-28',
    readTime: 11,
    views: 4820,
    likes: 176,
    status: 'draft',
    tags: ['Go', 'Concurrency', 'Systems'],
  },
  {
    id: '10',
    slug: 'ci-cd-github-actions-advanced',
    title: 'Advanced GitHub Actions: Building Enterprise-Grade CI/CD',
    excerpt: 'Matrix builds, reusable workflows, self-hosted runners, OIDC authentication, and cost optimization strategies for GitHub Actions at scale.',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop&auto=format',
    category: CATEGORIES[4],
    author: AUTHORS[3],
    publishedAt: '2024-04-24',
    readTime: 13,
    views: 3640,
    likes: 145,
    status: 'scheduled',
    tags: ['GitHub Actions', 'CI/CD', 'DevOps'],
  },
];

export const ARTICLE_CONTENT = `
## Introduction

Type safety is one of the most powerful tools in a software engineer's arsenal. When building APIs, the challenge isn't just defining your types in TypeScript — it's ensuring those types hold at runtime, where untrusted data enters your system.

This is where **Zod** comes in. Zod is a TypeScript-first schema validation library that lets you define schemas and infer their types simultaneously, eliminating the frustrating duplication between TypeScript interfaces and validation logic.

## Why Runtime Validation Matters

Consider a simple API endpoint that accepts a user registration payload:

\`\`\`typescript
interface UserRegistration {
  email: string;
  password: string;
  username: string;
  age: number;
}

// This is NOT safe — TypeScript types are erased at runtime
app.post('/register', (req, res) => {
  const data: UserRegistration = req.body; // ⚠️ No runtime check!
  createUser(data);
});
\`\`\`

The TypeScript types give you compile-time safety, but at runtime \`req.body\` could contain anything — malformed data, missing fields, or malicious payloads.

## Defining Schemas with Zod

With Zod, you define a schema once and get both runtime validation and TypeScript types:

\`\`\`typescript
import { z } from 'zod';

const UserRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter'),
  username: z.string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  age: z.number().int().min(13, 'Must be at least 13 years old').max(120),
});

// TypeScript type is inferred automatically
type UserRegistration = z.infer<typeof UserRegistrationSchema>;
\`\`\`

## Building a Type-Safe API Layer

Now let's build a complete, type-safe API handler:

\`\`\`typescript
import express from 'express';
import { z } from 'zod';

function validate<T>(schema: z.ZodType<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
    }

    req.validatedBody = result.data;
    next();
  };
}

app.post(
  '/register',
  validate(UserRegistrationSchema),
  async (req, res) => {
    // req.validatedBody is fully typed here
    const user = await createUser(req.validatedBody);
    res.json({ user });
  }
);
\`\`\`

## Advanced Patterns

### Partial and Recursive Schemas

Zod supports partial schemas for \`PATCH\` endpoints and recursive schemas for tree structures:

\`\`\`typescript
// Partial schema for updates
const UpdateUserSchema = UserRegistrationSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  'At least one field must be provided'
);

// Recursive schema for nested categories
type Category = {
  id: string;
  name: string;
  children: Category[];
};

const CategorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    id: z.string().uuid(),
    name: z.string(),
    children: z.array(CategorySchema),
  })
);
\`\`\`

## Conclusion

By combining TypeScript's static type checking with Zod's runtime validation, you eliminate an entire class of bugs at the boundary between your application and the outside world. The schemas serve as living documentation, the TypeScript types are always in sync, and you catch invalid data before it corrupts your database or causes unexpected errors deep in your business logic.
`;

export const DASHBOARD_STATS: DashboardStats = {
  totalViews: 84230,
  totalArticles: 12,
  publishedArticles: 8,
  draftArticles: 3,
  scheduledArticles: 1,
  totalFollowers: 2840,
  totalLikes: 3218,
  weeklyViews: [1200, 1450, 980, 1820, 2100, 1650, 1890],
  monthlyViews: [28000, 31000, 26000, 34000, 38000, 42000],
};
