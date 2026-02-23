export default function WeatherLoading() {
  return (
    <div className="min-h-screen bg-stone-100">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-4">
          <div className="w-5 h-5 bg-stone-200 rounded animate-pulse" />
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-stone-200 animate-pulse" />
            <div className="h-5 w-20 bg-stone-200 rounded animate-pulse" />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-4">
        {/* Current conditions skeleton */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-16 bg-stone-200 rounded animate-pulse" />
            <div className="h-8 w-8 bg-stone-100 rounded animate-pulse" />
          </div>
          <div className="h-4 w-24 bg-stone-100 rounded animate-pulse mb-4" />
          <div className="flex gap-6">
            <div className="h-8 w-16 bg-stone-100 rounded animate-pulse" />
            <div className="h-8 w-16 bg-stone-100 rounded animate-pulse" />
            <div className="h-8 w-16 bg-stone-100 rounded animate-pulse" />
          </div>
        </div>

        {/* Rainfall chart skeleton */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex justify-between mb-4">
            <div className="h-3 w-14 bg-stone-200 rounded animate-pulse" />
            <div className="h-3 w-32 bg-stone-100 rounded animate-pulse" />
          </div>
          <div className="flex items-end gap-px" style={{ height: 120 }}>
            {[...Array(37)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-stone-100 rounded-t animate-pulse"
                style={{ height: `${10 + Math.random() * 70}%` }}
              />
            ))}
          </div>
        </div>

        {/* Forecast skeleton */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="h-3 w-24 bg-stone-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-8 bg-stone-100 rounded animate-pulse" />
                <div className="h-4 w-4 bg-stone-100 rounded animate-pulse" />
                <div className="flex-1 h-3 bg-stone-100 rounded animate-pulse" />
                <div className="h-4 w-16 bg-stone-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
