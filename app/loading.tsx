export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-brand-gold/30 border-t-brand-gold animate-spin" />
        <p className="text-brand-silver/60 text-sm">Loading...</p>
      </div>
    </div>
  )
}
