// Streaming skeleton mirroring the dashboard grid: greeting, then
// left featured-property card + right column of payment/stat/table cards.

const card = "bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl"
const pulse = "animate-pulse bg-[#1B3A5C]/5 rounded-lg"

export default function DashboardLoading() {
  return (
    <div className="pb-12 space-y-6" aria-busy="true" aria-label="Loading dashboard">
      {/* Greeting */}
      <div className="space-y-2">
        <div className={`${pulse} h-2.5 w-40`} />
        <div className={`${pulse} h-8 w-72 max-w-full`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)] gap-6">
        {/* Left: featured property card */}
        <div className={`${card} overflow-hidden self-start`}>
          <div className="animate-pulse bg-[#1B3A5C]/5 aspect-[4/3] w-full" />
          <div className="p-5 space-y-5">
            <div className="space-y-1.5">
              <div className={`${pulse} h-5 w-3/4`} />
              <div className={`${pulse} h-3 w-1/2`} />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className={`${pulse} h-6 w-8`} />
                  <div className={`${pulse} h-2 w-10`} />
                </div>
              ))}
            </div>
            <div className={`${pulse} h-2 w-full rounded-full`} />
            <div className={`${pulse} h-20 w-full`} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6 min-w-0">
          {/* Payments card */}
          <div className={`${card} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`${pulse} h-4 w-24`} />
              <div className={`${pulse} h-5 w-20 rounded-full`} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className={`${pulse} h-6 w-20`} />
                  <div className={`${pulse} h-2.5 w-14`} />
                </div>
              ))}
            </div>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${card} p-4 space-y-3`}>
                <div className={`${pulse} h-4 w-4`} />
                <div className={`${pulse} h-6 w-14`} />
                <div className={`${pulse} h-2.5 w-16`} />
              </div>
            ))}
          </div>

          {/* Table-shaped card */}
          <div className={`${card} overflow-hidden`}>
            <div className="px-5 py-4 border-b border-[#1B3A5C]/8 flex items-center justify-between">
              <div className={`${pulse} h-4 w-32`} />
              <div className={`${pulse} h-4 w-20`} />
            </div>
            <div className="divide-y divide-[#1B3A5C]/5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                  <div className={`${pulse} h-3.5 w-20 shrink-0`} />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className={`${pulse} h-3.5 w-2/5`} />
                    <div className={`${pulse} h-2.5 w-1/4`} />
                  </div>
                  <div className={`${pulse} h-5 w-16 rounded-full shrink-0`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
