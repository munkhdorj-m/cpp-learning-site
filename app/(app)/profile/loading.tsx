export default function Loading() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="h-28 skeleton-shimmer rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 skeleton-shimmer rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 skeleton-shimmer rounded-xl" />
        ))}
      </div>
      <div className="h-48 skeleton-shimmer rounded-xl" />
      <div className="h-64 skeleton-shimmer rounded-xl" />
    </div>
  );
}
