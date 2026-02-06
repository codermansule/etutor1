export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Top bar skeleton */}
      <div className="h-8 w-64 animate-pulse rounded bg-white/5" />

      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-32 animate-pulse rounded-2xl bg-white/5" />
        <div className="h-32 animate-pulse rounded-2xl bg-white/5" />
        <div className="h-32 animate-pulse rounded-2xl bg-white/5" />
      </div>

      {/* Content area skeleton */}
      <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
    </div>
  );
}
