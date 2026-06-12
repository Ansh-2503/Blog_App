export default function ArticleDetailLoading() {
  return (
    <div className="animate-pulse bg-background">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="h-4 w-64 rounded bg-muted" />
      </div>
      <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-72 rounded-2xl bg-muted md:h-96" />
      </div>
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <div className="h-10 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
      </div>
    </div>
  );
}
