export default function BlogLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-4 px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-8 w-48 rounded-lg bg-muted" />
      <div className="h-4 w-72 rounded bg-muted" />
      <div className="h-10 rounded-xl bg-muted" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
