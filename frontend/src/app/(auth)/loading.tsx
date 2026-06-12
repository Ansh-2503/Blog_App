export default function AuthLoading() {
  return (
    <div className="w-full max-w-sm animate-pulse">
      <div className="mx-auto mb-8 h-8 w-48 rounded-lg bg-muted" />
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="h-10 rounded-lg bg-muted" />
        <div className="h-10 rounded-lg bg-muted" />
      </div>
      <div className="space-y-4">
        <div className="h-10 rounded-lg bg-muted" />
        <div className="h-10 rounded-lg bg-muted" />
        <div className="h-10 rounded-lg bg-muted" />
      </div>
    </div>
  );
}
