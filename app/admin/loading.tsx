import { Skeleton } from '@/components/ui/skeleton'

export default function AdminLoading() {
  return (
    <div className="space-y-4" aria-label="Loading admin panel">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72 max-w-full opacity-70" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-6 space-y-3">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-4 w-24 opacity-70" />
          </div>
        ))}
      </div>
      <div className="glass-card p-6 mt-6 space-y-2">
        <Skeleton className="h-4 w-full opacity-60" />
        <Skeleton className="h-4 w-5/6 opacity-60" />
      </div>
    </div>
  )
}
