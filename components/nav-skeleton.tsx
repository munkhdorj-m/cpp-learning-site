export function NavSkeleton() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center gap-4 px-4">
        {/* Logo skeleton */}
        <div className="h-8 w-24 skeleton-shimmer rounded-lg" />

        {/* Nav links skeleton */}
        <div className="hidden md:flex items-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-16 skeleton-shimmer rounded-lg"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>

        {/* Right side skeleton */}
        <div className="ml-auto flex items-center gap-2">
          <div className="h-8 w-8 skeleton-shimmer rounded-full" />
          <div className="h-8 w-8 skeleton-shimmer rounded-full" />
          <div className="h-8 w-8 skeleton-shimmer rounded-full" />
        </div>
      </div>
    </header>
  );
}
