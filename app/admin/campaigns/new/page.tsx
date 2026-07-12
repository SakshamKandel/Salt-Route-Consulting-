import { CampaignComposer } from "./CampaignComposer"

export default function NewCampaignPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[9px] font-medium text-[#1B3A5C]/35 uppercase tracking-[0.35em] mb-1">Outreach</p>
        <h2 className="font-display text-2xl md:text-3xl text-[#1B3A5C] tracking-wide">New Campaign</h2>
        <p className="text-[12px] text-[#1B3A5C]/45 mt-1">Compose and send a bulk email to your user segments.</p>
      </div>
      <CampaignComposer />
    </div>
  )
}
