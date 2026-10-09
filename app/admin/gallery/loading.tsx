import { Skeleton } from '@/components/ui/skeleton'

export default function AdminGalleryLoading() {
  return (
    <div aria-label="Loading gallery posts">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72 max-w-full opacity-70" />
        </div>
        <Skeleton className="h-11 w-36" />
      </div>
      <Skeleton className="h-10 w-full mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card overflow-hidden">
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2 opacity-70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
