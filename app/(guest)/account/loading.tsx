export default function AccountLoading() {
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Loading">
      {/* Heading placeholder */}
      <div className="animate-pulse space-y-2">
        <div className="h-3.5 w-44 bg-[#1B3A5C]/5 rounded-lg" />
        <div className="h-9 w-72 bg-[#1B3A5C]/5 rounded-lg" />
      </div>

      {/* Stat strip skeleton */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-4 sm:p-5 animate-pulse">
            <div className="h-4 w-4 bg-[#1B3A5C]/5 rounded-lg mb-2.5" />
            <div className="h-7 w-10 bg-[#1B3A5C]/5 rounded-lg" />
            <div className="h-3 w-20 bg-[#1B3A5C]/5 rounded-lg mt-2" />
          </div>
        ))}
      </div>

      {/* Wide hero-card skeleton */}
      <div className="flex flex-col sm:flex-row bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl overflow-hidden animate-pulse">
        <div className="w-full sm:w-48 h-40 sm:h-auto bg-[#1B3A5C]/5 shrink-0" />
        <div className="flex-1 p-5 sm:p-6 space-y-4">
          <div className="h-3 w-28 bg-[#1B3A5C]/5 rounded-lg" />
          <div className="h-6 w-3/5 bg-[#1B3A5C]/5 rounded-lg" />
          <div className="flex gap-6 pt-2">
            <div className="h-10 w-32 bg-[#1B3A5C]/5 rounded-lg" />
            <div className="h-10 w-32 bg-[#1B3A5C]/5 rounded-lg" />
          </div>
          <div className="h-3 w-36 bg-[#1B3A5C]/5 rounded-lg" />
        </div>
      </div>

      {/* Two-column card skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((col) => (
          <div key={col} className="space-y-3">
            <div className="h-4 w-32 bg-[#1B3A5C]/5 rounded-lg animate-pulse" />
            <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl divide-y divide-[#1B3A5C]/5 overflow-hidden">
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
                  <div className="w-10 h-10 rounded-lg bg-[#1B3A5C]/5 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 bg-[#1B3A5C]/5 rounded-lg" />
                    <div className="h-3 w-1/3 bg-[#1B3A5C]/5 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
