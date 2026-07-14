export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 skeleton-shimmer rounded-lg" />
      <div className="space-y-2">
        <div className="h-6 skeleton-shimmer rounded-full" />
        <div className="flex gap-2">
          <div className="h-9 flex-1 skeleton-shimmer rounded-md" />
          <div className="h-9 w-32 skeleton-shimmer rounded-md" />
          <div className="h-9 w-32 skeleton-shimmer rounded-md" />
          <div className="h-9 w-32 skeleton-shimmer rounded-md" />
        </div>
      </div>
      <div className="space-y-1">
        {Array.from({ length: 12 }).map((_, i) => (
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
