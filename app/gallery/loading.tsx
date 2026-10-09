import { Skeleton, GalleryGridSkeleton } from '@/components/ui/skeleton'

export default function GalleryLoading() {
  return (
    <div className="min-h-screen bg-brand-navy">
      <div className="page-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <Skeleton className="h-9 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 max-w-full mx-auto opacity-70" />
        </div>
      </div>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12" aria-label="Loading gallery">
        <Skeleton className="h-10 w-72 max-w-full mx-auto mb-8" />
        <GalleryGridSkeleton count={6} />
      </section>
    </div>
  )
}
