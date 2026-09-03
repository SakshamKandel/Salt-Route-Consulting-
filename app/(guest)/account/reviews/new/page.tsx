"use client"

export const dynamic = "force-dynamic"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { createReviewAction } from "./actions"
import { Star, ImagePlus, X, AlertCircle, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary"

const schema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().min(10, "Please share a little more about the stay"),
  images: z.array(z.object({ url: z.string(), publicId: z.string().optional() })).optional(),
})

function NewReviewContent() {
  const searchParams = useSearchParams()
  const bookingId = (searchParams.get("bookingId") || searchParams.get("booking")) as string | undefined

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<{ url: string; publicId?: string }[]>([])

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { bookingId: bookingId || "", rating: 0, comment: "", images: [] },
  })

  if (!bookingId) {
    return (
      <div className="max-w-2xl mx-auto bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-8 sm:p-12 text-center space-y-4">
        <Star className="h-8 w-8 text-[#1B3A5C]/15 mx-auto" strokeWidth={1.5} />
        <h1 className="font-display text-2xl text-[#1B3A5C] tracking-wide">Review Not Ready</h1>
        <p className="text-[13px] text-[#1B3A5C]/60">Please choose a completed stay before writing a review.</p>
        <Link
          href="/account/bookings"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B3A5C] text-[#FFFAF3] rounded-lg text-[13px] font-medium hover:bg-[#2A4F7A] transition-colors"
        >
          Back to Reservations <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    )
  }

  async function onSubmit(data: z.infer<typeof schema>) {
    setIsPending(true)
    setError(null)
    setSuccess(null)

    const res = await createReviewAction({ ...data, images: uploadedImages })

    if (res?.error) {
      setError(res.error)
    } else if (res?.success) {
      setSuccess(res.success)
    }
    setIsPending(false)
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-8 sm:p-12 text-center space-y-4">
        <div className="w-12 h-px bg-[#C9A96E] mx-auto" />
        <h1 className="font-display text-2xl text-[#1B3A5C] tracking-wide">Thank You</h1>
        <p className="text-[13px] text-emerald-600">{success}</p>
        <Link
          href="/account/reviews"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B3A5C] text-[#FFFAF3] rounded-lg text-[13px] font-medium hover:bg-[#2A4F7A] transition-colors"
        >
          View My Reviews <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <p className="text-[11px] font-medium text-[#C9A96E] uppercase tracking-[0.18em] mb-1.5">
          Guest Reflections
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-[#1B3A5C] tracking-wide">Share Your Stay</h1>
        <p className="text-[13px] text-[#1B3A5C]/60 mt-2">
          Tell future guests what made your stay memorable.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-rose-200/60 bg-rose-50 text-rose-600 text-[13px]">
          <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          {error}
        </div>
      )}

      <div className="bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] uppercase tracking-[0.14em] text-[#1B3A5C]/70 font-medium">Rating</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            size={28}
                            strokeWidth={1.5}
                            fill={star <= field.value ? "#C9A96E" : "none"}
                            color={star <= field.value ? "#C9A96E" : "rgba(27,58,92,0.15)"}
                          />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage className="text-rose-600 text-[13px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] uppercase tracking-[0.14em] text-[#1B3A5C]/70 font-medium">Your Reflection</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your stay..."
                      className="min-h-[150px] bg-[#FBF9F4] border-[#1B3A5C]/10 rounded-lg text-[15px] leading-relaxed text-[#1B3A5C] px-4 py-3 placeholder:text-[#1B3A5C]/40 focus-visible:border-[#1B3A5C]/30 focus-visible:ring-0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-rose-600 text-[13px]" />
                </FormItem>
              )}
            />

            {/* Photo upload */}
            <div className="space-y-3">
              <p className="text-[13px] uppercase tracking-[0.14em] text-[#1B3A5C]/70 font-medium">
                Photos <span className="text-[#1B3A5C]/55 normal-case tracking-normal font-normal">(optional, up to 5)</span>
              </p>
              <div className="flex flex-wrap gap-3">
                {uploadedImages.map((img, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-[#1B3A5C]/8 group">
                    <Image src={img.url} alt={`Review photo ${i + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setUploadedImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-[#1B3A5C]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={18} className="text-[#FFFAF3]" />
                    </button>
                  </div>
                ))}
                {uploadedImages.length < 5 && (
                  <CldUploadWidget
                    signatureEndpoint="/api/upload/signature"
                    options={{ multiple: true, maxFiles: 5 - uploadedImages.length, folder: "salt-route/reviews" }}
                    onSuccess={(result: CloudinaryUploadWidgetResults) => {
                      const info = typeof result.info === "object" ? result.info : undefined
                      if (info?.secure_url) {
                        setUploadedImages((prev) => [
                          ...prev,
                          { url: info.secure_url, publicId: info.public_id },
                        ])
                      }
                    }}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        onClick={() => open()}
                        className="w-24 h-24 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-[#1B3A5C]/15 rounded-lg text-[#1B3A5C]/55 hover:border-[#C9A96E]/60 hover:text-[#C9A96E] transition-colors"
                      >
                        <ImagePlus size={20} strokeWidth={1.5} />
                        <span className="text-[11px] uppercase tracking-[0.15em] font-medium">Add</span>
                      </button>
                    )}
                  </CldUploadWidget>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center px-6 py-3 bg-[#1B3A5C] text-[#FFFAF3] rounded-lg text-[13px] font-medium hover:bg-[#2A4F7A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? "Sharing..." : "Share Review"}
            </button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default function NewReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto bg-[#FFFAF3] border border-[#1B3A5C]/8 rounded-xl p-8 sm:p-12 text-center">
          <p className="text-xs text-[#1B3A5C]/50">Loading review form...</p>
        </div>
      }
    >
      <NewReviewContent />
    </Suspense>
  )
}
