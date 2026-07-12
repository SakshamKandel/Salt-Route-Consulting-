// Streaming skeleton shown while admin pages fetch live data.
// Design-system aligned: cream cards, navy-tinted pulse blocks.

const card = "bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl"
const pulse = "animate-pulse bg-[#1B3A5C]/5 rounded-lg"

export default function AdminLoading() {
  return (
    <div className="space-y-6 pb-12" aria-busy="true" aria-label="Loading">
      {/* Header: eyebrow + title + subtitle */}
      <div className="space-y-2">
        <div className={`${pulse} h-2.5 w-24`} />
        <div className={`${pulse} h-8 w-64`} />
        <div className={`${pulse} h-3.5 w-80 max-w-full`} />
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${card} p-4 space-y-3`}>
            <div className={`${pulse} h-4 w-4`} />
            <div className={`${pulse} h-6 w-16`} />
            <div className={`${pulse} h-2.5 w-20`} />
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
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className={`${pulse} h-3.5 w-20 shrink-0`} />
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className={`${pulse} h-3.5 w-2/5`} />
                <div className={`${pulse} h-2.5 w-1/4`} />
              </div>
              <div className={`${pulse} h-5 w-16 rounded-full shrink-0`} />
              <div className={`${pulse} h-3 w-14 shrink-0 hidden sm:block`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
