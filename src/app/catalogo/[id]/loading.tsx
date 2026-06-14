export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-9 w-40 bg-muted rounded animate-pulse mb-6" />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square rounded-lg bg-muted animate-pulse" />
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-6 w-20 bg-muted rounded-full animate-pulse" />
              ))}
            </div>
            <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-10 w-40 bg-muted rounded animate-pulse" />
          <div className="border-t" />
          <div className="space-y-2">
            <div className="h-5 w-24 bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-12 w-full bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
