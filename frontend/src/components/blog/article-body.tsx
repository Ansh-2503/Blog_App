import DOMPurify from 'isomorphic-dompurify';
import { CodeBlock } from '@/components/blog/code-block';

const sampleCode1 = `interface UserRegistration {
  email: string;
  password: string;
  username: string;
  age: number;
}

// This is NOT safe — TypeScript types are erased at runtime
app.post('/register', (req, res) => {
  const data: UserRegistration = req.body; // ⚠️ No runtime check!
  createUser(data);
});`;

const sampleCode2 = `import { z } from 'zod';

const UserRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter'),
  username: z.string()
    .min(3).max(20)
    .regex(/^[a-zA-Z0-9_]+$/),
  age: z.number().int().min(13).max(120),
});

// TypeScript type is inferred automatically
type UserRegistration = z.infer<typeof UserRegistrationSchema>;`;

const sampleCode3 = `function validate<T>(schema: z.ZodType<T>) {
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
}`;

export function ArticleBody({ content }: { content?: string }) {
  if (content) {
    // Sanitize the HTML to prevent XSS vulnerabilities
    const cleanContent = DOMPurify.sanitize(content);
    return (
      <div
        className="prose max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: cleanContent }}
      />
    );
  }

  return (
    <div className="prose max-w-none">
      <h2
        id="introduction"
        className="mb-4 mt-8 scroll-mt-20 text-xl font-semibold text-foreground"
      >
        Introduction
      </h2>
      <p className="mb-4 leading-relaxed text-muted-foreground">
        Type safety is one of the most powerful tools in a software
        engineer&apos;s arsenal. When building APIs, the challenge isn&apos;t
        just defining your types in TypeScript — it&apos;s ensuring those types
        hold at runtime, where untrusted data enters your system.
      </p>
      <p className="mb-4 leading-relaxed text-muted-foreground">
        This is where <strong className="text-foreground">Zod</strong> comes
        in. Zod is a TypeScript-first schema validation library that lets you
        define schemas and infer their types simultaneously, eliminating the
        frustrating duplication between TypeScript interfaces and validation
        logic.
      </p>

      <h2
        id="why-runtime-validation"
        className="mb-4 mt-8 scroll-mt-20 text-xl font-semibold text-foreground"
      >
        Why Runtime Validation Matters
      </h2>
      <p className="mb-4 leading-relaxed text-muted-foreground">
        Consider a simple API endpoint that accepts a user registration
        payload:
      </p>
      <CodeBlock code={sampleCode1} />
      <p className="mb-4 leading-relaxed text-muted-foreground">
        The TypeScript types give you compile-time safety, but at runtime{' '}
        <code className="rounded bg-accent/60 px-1.5 py-0.5 font-mono text-sm text-primary">
          req.body
        </code>{' '}
        could contain anything — malformed data, missing fields, or malicious
        payloads.
      </p>

      <h2
        id="defining-schemas"
        className="mb-4 mt-8 scroll-mt-20 text-xl font-semibold text-foreground"
      >
        Defining Schemas with Zod
      </h2>
      <p className="mb-4 leading-relaxed text-muted-foreground">
        With Zod, you define a schema once and get both runtime validation and
        TypeScript types:
      </p>
      <CodeBlock code={sampleCode2} />

      <h2
        id="type-safe-api"
        className="mb-4 mt-8 scroll-mt-20 text-xl font-semibold text-foreground"
      >
        Building a Type-Safe API Layer
      </h2>
      <p className="mb-4 leading-relaxed text-muted-foreground">
        Now let&apos;s build a complete middleware for validation:
      </p>
      <CodeBlock code={sampleCode3} />

      <div className="my-6 rounded-xl border border-primary/20 bg-primary/8 p-5">
        <p className="mb-1 text-sm font-medium text-foreground">💡 Pro tip</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Use{' '}
          <code className="font-mono text-xs text-primary">schema.safeParse()</code>{' '}
          instead of{' '}
          <code className="font-mono text-xs text-primary">schema.parse()</code>{' '}
          in production. It returns a discriminated union instead of throwing,
          making error handling explicit and type-safe.
        </p>
      </div>

      <h2
        id="advanced-patterns"
        className="mb-4 mt-8 scroll-mt-20 text-xl font-semibold text-foreground"
      >
        Advanced Patterns
      </h2>
      <h3
        id="partial-recursive"
        className="mb-3 mt-6 scroll-mt-20 text-lg font-semibold text-foreground"
      >
        Partial and Recursive Schemas
      </h3>
      <p className="mb-4 leading-relaxed text-muted-foreground">
        Zod supports partial schemas for{' '}
        <code className="rounded bg-accent/60 px-1.5 py-0.5 font-mono text-sm text-primary">
          PATCH
        </code>{' '}
        endpoints and recursive schemas for tree structures.
      </p>

      <h2
        id="conclusion"
        className="mb-4 mt-8 scroll-mt-20 text-xl font-semibold text-foreground"
      >
        Conclusion
      </h2>
      <p className="mb-4 leading-relaxed text-muted-foreground">
        By combining TypeScript&apos;s static type checking with Zod&apos;s
        runtime validation, you eliminate an entire class of bugs at the boundary
        between your application and the outside world. The schemas serve as
        living documentation, the TypeScript types are always in sync, and you
        catch invalid data before it corrupts your database.
      </p>
    </div>
  );
}
