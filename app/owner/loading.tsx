export default function OwnerLoading() {
  return (
    <div className="pb-12 space-y-8">
      {/* Header skeleton */}
      <div className="animate-pulse space-y-2">
        <div className="h-2.5 w-28 bg-[#1B3A5C]/5 rounded-lg" />
        <div className="h-8 w-72 max-w-full bg-[#1B3A5C]/5 rounded-lg" />
      </div>

      {/* Stat strip skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl p-4 sm:p-5"
          >
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-4 bg-[#1B3A5C]/5 rounded-lg" />
              <div className="h-7 w-16 bg-[#1B3A5C]/5 rounded-lg" />
              <div className="h-2.5 w-20 bg-[#1B3A5C]/5 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* List card skeleton */}
      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1B3A5C]/5">
          <div className="animate-pulse h-3 w-40 bg-[#1B3A5C]/5 rounded-lg" />
        </div>
        <div className="divide-y divide-[#1B3A5C]/5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="animate-pulse w-9 h-9 bg-[#1B3A5C]/5 rounded-lg shrink-0" />
              <div className="flex-1 animate-pulse space-y-2">
                <div className="h-3.5 w-1/3 bg-[#1B3A5C]/5 rounded-lg" />
                <div className="h-3 w-2/3 bg-[#1B3A5C]/5 rounded-lg" />
              </div>
              <div className="animate-pulse hidden sm:block h-5 w-20 bg-[#1B3A5C]/5 rounded-lg shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
