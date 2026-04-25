"use client"
import { useState, use } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createReviewAction } from "./actions"
import { Star, ImagePlus, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary"

const schema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
  images: z.array(z.object({ url: z.string(), publicId: z.string().optional() })).optional(),
})

export default function NewReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = use(searchParams)
  const bookingId = (resolvedParams.bookingId || resolvedParams.booking) as string | undefined

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
      <div className="space-y-6 max-w-2xl text-center">
        <h1 className="text-3xl font-display text-navy">Invalid Request</h1>
        <p className="text-gray-500">Missing booking ID to review.</p>
        <Button asChild><Link href="/account/bookings">Back to Bookings</Link></Button>
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
      <div className="space-y-6 max-w-2xl text-center">
        <h1 className="text-3xl font-display text-navy">Thank You!</h1>
        <p className="text-green-600">{success}</p>
        <Button asChild><Link href="/account/reviews">View My Reviews</Link></Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-display text-navy">Write a Review</h1>
      
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => field.onChange(star)}
                        className="focus:outline-none"
                      >
                        <Star 
                          size={32} 
                          fill={star <= field.value ? "#D4AF37" : "none"} 
                          color={star <= field.value ? "#D4AF37" : "#CBD5E1"} 
                        />
                      </button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Review</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us about your stay..." 
                    className="min-h-[150px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Photo upload */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Photos <span className="text-slate-400 font-normal">(optional, up to 5)</span></p>
            <div className="flex flex-wrap gap-3">
              {uploadedImages.map((img, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 group">
                  <Image src={img.url} alt={`Review photo ${i + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setUploadedImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={18} className="text-white" />
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
                      className="w-24 h-24 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-navy/40 hover:text-navy transition-colors"
                    >
                      <ImagePlus size={20} />
                      <span className="text-[10px] uppercase tracking-wider">Add</span>
                    </button>
                  )}
                </CldUploadWidget>
              )}
            </div>
          </div>

          <Button type="submit" className="bg-navy text-cream" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
