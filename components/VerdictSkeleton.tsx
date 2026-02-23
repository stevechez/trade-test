export default function VerdictSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-8">
        <div className="space-y-3">
          <div className="h-10 w-64 bg-slate-200 rounded-xl" />
          <div className="h-4 w-48 bg-slate-100 rounded-md" />
        </div>
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-50 rounded-2xl border border-slate-100" />
        ))}
      </div>

      {/* Findings List Skeleton */}
      <div className="space-y-4 mt-8">
        <div className="h-4 w-32 bg-slate-100 rounded ml-4 mb-4" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white border border-slate-200 rounded-2xl p-5" />
        ))}
      </div>
    </div>
  )
}