"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Send, Eye, ArrowRight, ArrowLeft, Loader2 } from "lucide-react"
import {
  createCampaignAction,
  enqueueCampaignAction,
  previewSegmentCountAction,
} from "../actions"
import type { SegmentSpec } from "@/lib/admin/segments"

const schema = z.object({
  name: z.string().min(1, "Required"),
  subject: z.string().min(1, "Required"),
  body: z.string().min(10, "Body must be at least 10 characters"),
  roles: z.array(z.string()),
  sendNow: z.boolean(),
})

type FormData = z.infer<typeof schema>

const STEP_LABELS = ["Segment", "Compose", "Review"]

export function CampaignComposer() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [previewCount, setPreviewCount] = useState<number | null>(null)
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { roles: [] as string[], sendNow: true },
  })

  const selectedRoles = watch("roles") || []

  const handlePreview = () => {
    const segment: SegmentSpec = selectedRoles.length
      ? { roles: selectedRoles as SegmentSpec["roles"] }
      : {}
    startTransition(async () => {
      const res = await previewSegmentCountAction(segment)
      setPreviewCount(res.count)
      setStep(1)
    })
  }

  const onSubmit = (data: unknown) => {
    const d = data as FormData
    startTransition(async () => {
      const segment: SegmentSpec = selectedRoles.length
        ? { roles: selectedRoles as SegmentSpec["roles"] }
        : {}
      const res = await createCampaignAction({
        name: d.name,
        subject: d.subject,
        body: d.body,
        segment,
      })
      if ("error" in res) { toast.error(String(res.error)); return }
      setCampaignId((res as { id: string }).id)
      setStep(2)
    })
  }

  const handleSend = () => {
    if (!campaignId) return
    startTransition(async () => {
      const res = await enqueueCampaignAction(campaignId)
      if ("error" in res) { toast.error(res.error); return }
      toast.success(`Campaign queued for ${(res as { count: number }).count} recipients!`)
      router.push("/admin/campaigns")
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              i === step
                ? "bg-navy text-white"
                : i < step
                ? "bg-slate-100 text-slate-500"
                : "text-slate-400"
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                i < step ? "bg-emerald-500 text-white" : "bg-current/20"
              }`}>
                {i < step ? "✓" : i + 1}
              </span>
              {label}
            </div>
            {i < STEP_LABELS.length - 1 && (
              <ArrowRight className="h-4 w-4 text-slate-300 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Segment */}
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-navy mb-2">Select Audience</h3>
            <p className="text-sm text-slate-500">
              Choose which users will receive this campaign.
            </p>
          </div>
          <div className="space-y-3">
            {(["GUEST", "OWNER", "ADMIN"] as const).map((role) => (
              <label
                key={role}
                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedRoles.includes(role)
                    ? "border-navy bg-navy/5"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  value={role}
                  {...register("roles")}
                  className="w-4 h-4 accent-navy"
                />
                <div>
                  <p className="font-medium text-navy">{role}S</p>
                  <p className="text-xs text-slate-500">
                    {role === "GUEST" && "All registered guests who have made or browsed bookings"}
                    {role === "OWNER" && "Property owners on the platform"}
                    {role === "ADMIN" && "Admin team members only"}
                  </p>
                </div>
              </label>
            ))}
            <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedRoles.length === 0 ? "border-navy bg-navy/5" : "border-slate-200 hover:border-slate-300"
            }`}>
              <input
                type="radio"
                checked={selectedRoles.length === 0}
                onChange={() => {}}
                onClick={() => {}}
                readOnly
                className="w-4 h-4 accent-navy"
              />
              <div>
                <p className="font-medium text-navy">All Users</p>
                <p className="text-xs text-slate-500">Every registered user — guests, owners, and admins</p>
              </div>
            </label>
          </div>
          <Button
            onClick={handlePreview}
            disabled={isPending}
            className="bg-navy text-cream w-full"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Users className="h-4 w-4 mr-2" />}
            Preview Audience
          </Button>
        </div>
      )}

      {/* Step 1: Compose */}
      {step === 1 && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {previewCount !== null && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-700">
              <Users className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">
                This campaign will reach <strong>{previewCount.toLocaleString()} recipients</strong>
              </p>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-navy mb-2">Compose Email</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Campaign Name (internal only)</Label>
              <Input
                {...register("name")}
                placeholder="e.g. April Promo 2026"
                className="mt-1"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label>Subject Line</Label>
              <Input
                {...register("subject")}
                placeholder="e.g. Exclusive Spring Offer From Salt Route"
                className="mt-1"
              />
              {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
            </div>
            <div>
              <Label>Email Body</Label>
              <textarea
                {...register("body")}
                rows={10}
                placeholder="Write your email content here. Use double line breaks for new paragraphs."
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 resize-y"
              />
              {errors.body && <p className="text-xs text-red-500 mt-1">{errors.body.message}</p>}
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(0)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button type="submit" disabled={isPending} className="bg-navy text-cream flex-1">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              Review Campaign
            </Button>
          </div>
        </form>
      )}

      {/* Step 2: Review & Send */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-navy mb-2">Ready to Send</h3>
            <p className="text-sm text-slate-500">
              Campaign saved. Click Send to enqueue delivery to{" "}
              <strong>{previewCount?.toLocaleString()}</strong> recipients.
              A background worker will send emails at 5 per second.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm text-slate-600">
            <p><span className="font-medium">Audience:</span> {selectedRoles.length ? selectedRoles.join(", ") : "All users"}</p>
            <p><span className="font-medium">Recipients:</span> {previewCount?.toLocaleString()}</p>
            <p className="text-xs text-slate-400">
              Emails are sent via your SMTP provider. Large campaigns may take several minutes.
            </p>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button
              onClick={handleSend}
              disabled={isPending}
              className="bg-navy text-cream flex-1"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send Campaign
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
