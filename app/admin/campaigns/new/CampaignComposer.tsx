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
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium ${
              i === step
                ? "bg-[#1B3A5C] text-[#FFFAF3]"
                : i < step
                ? "bg-[#1B3A5C]/5 text-[#1B3A5C]/50"
                : "text-[#1B3A5C]/35"
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                i < step ? "bg-emerald-500 text-white" : "bg-current/20"
              }`}>
                {i < step ? "✓" : i + 1}
              </span>
              {label}
            </div>
            {i < STEP_LABELS.length - 1 && (
              <ArrowRight className="h-4 w-4 text-[#1B3A5C]/20 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Segment */}
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-[15px] font-semibold text-[#1B3A5C] mb-2">Select Audience</h3>
            <p className="text-[12px] text-[#1B3A5C]/45">
              Choose which users will receive this campaign.
            </p>
          </div>
          <div className="space-y-3">
            {(["GUEST", "OWNER", "ADMIN"] as const).map((role) => (
              <label
                key={role}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors bg-[#FFFAF3] ${
                  selectedRoles.includes(role)
                    ? "border-[#C9A96E] bg-[#C9A96E]/5"
                    : "border-[#1B3A5C]/10 hover:border-[#1B3A5C]/25"
                }`}
              >
                <input
                  type="checkbox"
                  value={role}
                  {...register("roles")}
                  className="w-4 h-4 accent-[#1B3A5C]"
                />
                <div>
                  <p className="text-[13px] font-medium text-[#1B3A5C]">{role}S</p>
                  <p className="text-[11px] text-[#1B3A5C]/45">
                    {role === "GUEST" && "All registered guests who have made or browsed bookings"}
                    {role === "OWNER" && "Property owners on the platform"}
                    {role === "ADMIN" && "Admin team members only"}
                  </p>
                </div>
              </label>
            ))}
            <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors bg-[#FFFAF3] ${
              selectedRoles.length === 0 ? "border-[#C9A96E] bg-[#C9A96E]/5" : "border-[#1B3A5C]/10 hover:border-[#1B3A5C]/25"
            }`}>
              <input
                type="radio"
                checked={selectedRoles.length === 0}
                onChange={() => {}}
                onClick={() => {}}
                readOnly
                className="w-4 h-4 accent-[#1B3A5C]"
              />
              <div>
                <p className="text-[13px] font-medium text-[#1B3A5C]">All Users</p>
                <p className="text-[11px] text-[#1B3A5C]/45">Every registered user — guests, owners, and admins</p>
              </div>
            </label>
          </div>
          <Button
            onClick={handlePreview}
            disabled={isPending}
            className="bg-[#1B3A5C] text-[#FFFAF3] hover:bg-[#2A4F7A] rounded-lg text-[12px] font-medium w-full"
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
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/60 rounded-xl p-4 text-emerald-700">
              <Users className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">
                This campaign will reach <strong>{previewCount.toLocaleString()} recipients</strong>
              </p>
            </div>
          )}
          <div>
            <h3 className="text-[15px] font-semibold text-[#1B3A5C] mb-2">Compose Email</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-[11px] font-medium text-[#1B3A5C]/60">Campaign Name (internal only)</Label>
              <Input
                {...register("name")}
                placeholder="e.g. April Promo 2026"
                className="mt-1"
              />
              {errors.name && <p className="text-xs text-[#B84040] mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label className="text-[11px] font-medium text-[#1B3A5C]/60">Subject Line</Label>
              <Input
                {...register("subject")}
                placeholder="e.g. Exclusive Spring Offer From Salt Route"
                className="mt-1"
              />
              {errors.subject && <p className="text-xs text-[#B84040] mt-1">{errors.subject.message}</p>}
            </div>
            <div>
              <Label className="text-[11px] font-medium text-[#1B3A5C]/60">Email Body</Label>
              <textarea
                {...register("body")}
                rows={10}
                placeholder="Write your email content here. Use double line breaks for new paragraphs."
                className="mt-1 w-full rounded-lg border border-[#1B3A5C]/10 bg-white/60 px-3 py-2 text-sm text-[#1B3A5C] focus:outline-none focus:border-[#1B3A5C]/30 resize-y"
              />
              {errors.body && <p className="text-xs text-[#B84040] mt-1">{errors.body.message}</p>}
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="border-[#1B3A5C]/15 text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 rounded-lg text-[12px] font-medium" onClick={() => setStep(0)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button type="submit" disabled={isPending} className="bg-[#1B3A5C] text-[#FFFAF3] hover:bg-[#2A4F7A] rounded-lg text-[12px] font-medium flex-1">
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
            <h3 className="text-[15px] font-semibold text-[#1B3A5C] mb-2">Ready to Send</h3>
            <p className="text-[12px] text-[#1B3A5C]/45">
              Campaign saved. Click Send to enqueue delivery to{" "}
              <strong>{previewCount?.toLocaleString()}</strong> recipients.
              A background worker will send emails at 5 per second.
            </p>
          </div>
          <div className="rounded-xl border border-[#1B3A5C]/8 bg-[#FFFAF3] p-4 space-y-2 text-[13px] text-[#1B3A5C]/60">
            <p><span className="font-medium text-[#1B3A5C]">Audience:</span> {selectedRoles.length ? selectedRoles.join(", ") : "All users"}</p>
            <p><span className="font-medium text-[#1B3A5C]">Recipients:</span> {previewCount?.toLocaleString()}</p>
            <p className="text-[11px] text-[#1B3A5C]/35">
              Emails are sent via your SMTP provider. Large campaigns may take several minutes.
            </p>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="border-[#1B3A5C]/15 text-[#1B3A5C]/60 hover:text-[#1B3A5C] hover:border-[#1B3A5C]/30 rounded-lg text-[12px] font-medium" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button
              onClick={handleSend}
              disabled={isPending}
              className="bg-[#1B3A5C] text-[#FFFAF3] hover:bg-[#2A4F7A] rounded-lg text-[12px] font-medium flex-1"
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
