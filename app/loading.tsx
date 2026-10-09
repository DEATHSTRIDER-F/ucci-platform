import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="min-h-[60vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6" aria-label="Loading page">
      <div className="text-center space-y-3">
        <Skeleton className="h-9 w-64 max-w-full mx-auto" />
        <Skeleton className="h-4 w-96 max-w-full mx-auto opacity-70" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card overflow-hidden">
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="p-5 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2 opacity-70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
