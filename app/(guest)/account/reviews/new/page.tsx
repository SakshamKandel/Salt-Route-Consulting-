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
import { Star } from "lucide-react"
import Link from "next/link"

const schema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
})

export default function NewReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = use(searchParams)
  const bookingId = resolvedParams.bookingId as string | undefined

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { bookingId: bookingId || "", rating: 0, comment: "" },
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
    
    const res = await createReviewAction(data)
    
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

          <Button type="submit" className="bg-navy text-cream" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
