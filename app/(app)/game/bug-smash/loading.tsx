export default function Loading() {
  return (
    <div className="space-y-3 max-w-5xl mx-auto">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg skeleton-shimmer" />
        <div className="space-y-2">
          <div className="h-7 w-40 skeleton-shimmer rounded-lg" />
          <div className="h-4 w-64 skeleton-shimmer rounded-lg" />
        </div>
      </div>
      <div className="aspect-video rounded-xl skeleton-shimmer" />
    </div>
  );
}
