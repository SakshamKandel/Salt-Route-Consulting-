"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary"
import { updateProfileAction } from "./actions"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { Camera, Check, AlertCircle } from "lucide-react"

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
})

export default function ProfileForm({ initialData }: { initialData: z.infer<typeof schema> }) {
  const { update } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(initialData.image || null)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  })

  async function onSubmit(data: z.infer<typeof schema>) {
    setIsPending(true)
    setError(null)
    setSuccess(null)
    
    const res = await updateProfileAction(data)
    
    if (res?.error) {
      setError(res.error)
    } else if (res?.success) {
      setSuccess(res.success)
      await update({ name: data.name, image: data.image })
    }
    setIsPending(false)
  }

  const inputClass = "rounded-lg border border-[#1B3A5C]/10 bg-[#FBF9F4] px-4 py-3 text-[15px] text-[#1B3A5C] focus-visible:border-[#1B3A5C]/30 focus-visible:ring-0 placeholder:text-[#1B3A5C]/40 transition-colors"

  return (
    <div className="space-y-8">
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-rose-200/60 bg-rose-50 text-rose-600 text-[13px]">
          <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-emerald-200/60 bg-emerald-50 text-emerald-600 text-[13px]">
          <Check className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          {success}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#1B3A5C]/[0.04] border border-[#1B3A5C]/8 shrink-0">
              {imageUrl ? (
                <Image src={imageUrl} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#1B3A5C]/55 font-display text-2xl">
                  {initialData.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
            </div>

            <CldUploadWidget 
              signatureEndpoint="/api/upload/signature"
              onSuccess={(result: CloudinaryUploadWidgetResults) => {
                const info = typeof result.info === "object" ? result.info : undefined
                const url = info?.secure_url
                if (url) {
                  setImageUrl(url)
                  form.setValue("image", url)
                }
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#1B3A5C]/10 text-[13px] uppercase tracking-[0.16em] font-medium text-[#1B3A5C]/60 hover:border-[#1B3A5C]/25 hover:text-[#1B3A5C] transition-colors"
                >
                  <Camera className="w-3 h-3" strokeWidth={1.5} />
                  <span>Upload Photo</span>
                </button>
              )}
            </CldUploadWidget>
          </div>

          {/* Fields */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] uppercase tracking-[0.14em] text-[#1B3A5C]/70 font-medium">Full Name</FormLabel>
                <FormControl><Input placeholder="Your Name" className={inputClass} {...field} value={field.value || ""} /></FormControl>
                <FormMessage className="text-rose-600 text-[13px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] uppercase tracking-[0.14em] text-[#1B3A5C]/70 font-medium">Phone Number</FormLabel>
                <FormControl><Input placeholder="+977 98XXXXXXXX" className={inputClass} {...field} value={field.value || ""} /></FormControl>
                <FormMessage className="text-rose-600 text-[13px]" />
              </FormItem>
            )}
          />

          <div className="pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center px-6 py-3 bg-[#1B3A5C] text-[#FFFAF3] rounded-lg text-[13px] font-medium hover:bg-[#2A4F7A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Form>
    </div>
  )
}
