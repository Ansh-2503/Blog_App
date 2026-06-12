import { AuthHeader } from '@/components/layout/auth-header';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AuthHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>
      <footer className="py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} DevPulse ·{' '}
        <a href="#" className="underline-offset-4 hover:text-foreground hover:underline">
          Privacy
        </a>
        {' · '}
        <a href="#" className="underline-offset-4 hover:text-foreground hover:underline">
          Terms
        </a>
      </footer>
    </div>
  );
}
