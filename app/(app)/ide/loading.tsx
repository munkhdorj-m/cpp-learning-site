export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-7 w-32 skeleton-shimmer rounded-lg" />
          <div className="h-4 w-48 skeleton-shimmer rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 skeleton-shimmer rounded-md" />
          <div className="h-8 w-20 skeleton-shimmer rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-[500px] skeleton-shimmer rounded-xl" />
        <div className="space-y-4">
          <div className="h-[200px] skeleton-shimmer rounded-xl" />
          <div className="h-[180px] skeleton-shimmer rounded-xl" />
        </div>
      </div>
    </div>
  );
}
