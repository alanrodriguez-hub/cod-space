export default function AdminLoading() {
  return (
    <div className="space-y-8">
      <div className="h-9 w-48 bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 h-20 bg-muted animate-pulse" />
        ))}
      </div>
      <div className="h-64 rounded-lg border bg-card bg-muted animate-pulse" />
    </div>
  );
}
