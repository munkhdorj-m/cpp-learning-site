export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 skeleton-shimmer rounded-lg" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-14 skeleton-shimmer rounded-lg"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
