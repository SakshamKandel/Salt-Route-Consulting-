import { Construction } from "lucide-react"

export default function PlaceholderPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">
          Coming soon
        </p>
        <h2 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">Page Under Construction</h2>
        <p className="text-[13px] text-[#1B3A5C]/45 mt-1">This section is currently being developed.</p>
      </div>
      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-2xl py-14 text-center">
        <Construction className="h-6 w-6 text-[#1B3A5C]/15 mx-auto mb-3" />
        <p className="text-[13px] text-[#1B3A5C]/35">This area will be available shortly.</p>
      </div>
    </div>
  )
}
