export default function PerfilLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-9 w-48 bg-muted rounded animate-pulse mb-8" />
      <div className="max-w-2xl mx-auto space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6 space-y-4">
            <div className="h-6 w-40 bg-muted rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-10 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
