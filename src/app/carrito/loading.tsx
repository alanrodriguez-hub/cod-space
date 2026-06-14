export default function CarritoLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-9 w-64 bg-muted rounded animate-pulse mb-8" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 flex gap-4">
              <div className="w-20 h-20 rounded-md bg-muted animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-64 rounded-lg border bg-card p-6 bg-muted animate-pulse" />
      </div>
    </div>
  );
}
