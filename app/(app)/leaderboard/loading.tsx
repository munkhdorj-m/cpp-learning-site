export default function Loading() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="h-8 w-32 skeleton-shimmer rounded-lg" />
      <div className="h-32 skeleton-shimmer rounded-xl" />
      <div className="flex items-end justify-center gap-3 pt-4 pb-2">
        <div className="h-20 w-20 skeleton-shimmer rounded-t-lg" />
        <div className="h-28 w-20 skeleton-shimmer rounded-t-lg" />
        <div className="h-16 w-20 skeleton-shimmer rounded-t-lg" />
      </div>
      <div className="space-y-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-12 skeleton-shimmer rounded-md"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
