"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Send, Pause, StopCircle } from "lucide-react"
import { enqueueCampaignAction, pauseCampaignAction, cancelCampaignAction } from "../actions"

export function CampaignActions({
  campaign,
}: {
  campaign: { id: string; status: string }
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleEnqueue = () => {
    startTransition(async () => {
      const res = await enqueueCampaignAction(campaign.id)
      if ("error" in res) toast.error(res.error)
      else {
        toast.success(`Campaign queued for ${(res as { count: number }).count} recipients!`)
        router.refresh()
      }
    })
  }

  const handlePause = () => {
    startTransition(async () => {
      await pauseCampaignAction(campaign.id)
      toast.success("Campaign paused")
      router.refresh()
    })
  }

  const handleCancel = () => {
    if (!confirm("Cancel this campaign? This cannot be undone.")) return
    startTransition(async () => {
      await cancelCampaignAction(campaign.id)
      toast.success("Campaign cancelled")
      router.refresh()
    })
  }

  return (
    <div className="flex gap-2">
      {(campaign.status === "DRAFT" || campaign.status === "PAUSED") && (
        <Button onClick={handleEnqueue} disabled={isPending} className="bg-navy text-cream">
          <Send className="h-4 w-4 mr-2" />
          {campaign.status === "PAUSED" ? "Resume" : "Send Now"}
        </Button>
      )}
      {campaign.status === "SENDING" && (
        <Button onClick={handlePause} disabled={isPending} variant="outline">
          <Pause className="h-4 w-4 mr-2" /> Pause
        </Button>
      )}
      {(campaign.status === "DRAFT" || campaign.status === "PAUSED" || campaign.status === "QUEUED") && (
        <Button onClick={handleCancel} disabled={isPending} variant="outline" className="text-red-600 border-red-200">
          <StopCircle className="h-4 w-4 mr-2" /> Cancel
        </Button>
      )}
    </div>
  )
}
