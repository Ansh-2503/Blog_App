export default function DashboardLoading() {
  return (
    <div className="max-w-6xl animate-pulse space-y-4 p-6">
      <div className="h-8 w-48 rounded-lg bg-muted" />
      <div className="grid grid-cols-3 gap-4">
        <div className="h-28 rounded-xl bg-muted" />
        <div className="h-28 rounded-xl bg-muted" />
        <div className="h-28 rounded-xl bg-muted" />
      </div>
      <div className="h-64 rounded-xl bg-muted" />
    </div>
  );
}
