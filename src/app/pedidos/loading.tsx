export default function PedidosLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-9 w-48 bg-muted rounded animate-pulse mb-8" />
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 w-28 bg-muted rounded animate-pulse" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex justify-between">
              <div className="h-5 w-40 bg-muted rounded animate-pulse" />
              <div className="h-5 w-20 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
