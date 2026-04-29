import { CampaignComposer } from "./CampaignComposer"

export default function NewCampaignPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display text-navy">New Campaign</h2>
        <p className="text-slate-500">Compose and send a bulk email to your user segments.</p>
      </div>
      <CampaignComposer />
    </div>
  )
}
