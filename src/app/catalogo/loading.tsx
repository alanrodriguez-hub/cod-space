export default function CatalogoLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-9 w-64 bg-muted rounded animate-pulse mb-8" />
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div className="space-y-2">
            <div className="h-5 w-24 bg-muted rounded animate-pulse" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </aside>
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card overflow-hidden">
                <div className="aspect-square bg-muted animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                  <div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
