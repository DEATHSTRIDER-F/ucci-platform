export default function AdminLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-brand-sapphire rounded" />
      <div className="h-4 w-72 bg-brand-sapphire/60 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-6">
            <div className="h-6 w-12 bg-brand-sapphire rounded mb-3" />
            <div className="h-4 w-24 bg-brand-sapphire/60 rounded" />
          </div>
        ))}
      </div>
      <div className="glass-card p-6 mt-6">
        <div className="h-4 w-full bg-brand-sapphire/40 rounded mb-2" />
        <div className="h-4 w-5/6 bg-brand-sapphire/40 rounded" />
      </div>
    </div>
  )
}
