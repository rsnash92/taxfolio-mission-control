export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-[#E8E5E0] rounded ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg p-4 border border-[#E8E5E0] shadow-sm space-y-3">
      <div className="flex justify-between items-center">
        <SkeletonLine className="h-3 w-24" />
        <SkeletonLine className="h-3 w-16" />
      </div>
      <SkeletonLine className="h-4 w-3/4" />
      <SkeletonLine className="h-3 w-full" />
      <SkeletonLine className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonKanbanColumn() {
  return (
    <div className="min-w-[280px] flex flex-col gap-2">
      <SkeletonLine className="h-5 w-28 mb-1" />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-[#E8E5E0]">
          <SkeletonLine className="h-3 w-20" />
          <SkeletonLine className="h-3 flex-1" />
          <SkeletonLine className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
