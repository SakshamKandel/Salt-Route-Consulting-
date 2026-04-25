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

  const inputClass = "rounded-none border-0 border-b border-charcoal/15 bg-transparent px-0 py-3 text-sm font-sans text-charcoal focus-visible:border-charcoal focus-visible:ring-0 placeholder:text-charcoal/25"

  return (
    <div className="space-y-10">
      {error && (
        <div className="flex items-center gap-3 p-4 border border-red-200 bg-red-50 text-red-600 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 border border-charcoal/10 bg-charcoal/[0.02] text-charcoal/70 text-xs">
          <Check className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          {success}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          {/* Avatar Upload */}
          <div className="flex items-center gap-8">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-charcoal/[0.03] border border-charcoal/5 shrink-0">
              {imageUrl ? (
                <Image src={imageUrl} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-charcoal/20 font-display text-2xl">
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
                  className="flex items-center gap-2 px-5 py-2.5 border border-charcoal/10 text-[9px] uppercase tracking-[0.2em] text-charcoal/50 hover:border-charcoal/20 hover:text-charcoal transition-all"
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
                <FormLabel className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40 font-medium">Full Name</FormLabel>
                <FormControl><Input placeholder="Your Name" className={inputClass} {...field} value={field.value || ""} /></FormControl>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[9px] uppercase tracking-[0.2em] text-charcoal/40 font-medium">Phone Number</FormLabel>
                <FormControl><Input placeholder="+977 98XXXXXXXX" className={inputClass} {...field} value={field.value || ""} /></FormControl>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )}
          />

          <div className="pt-6">
            <button
              type="submit"
              disabled={isPending}
              className="bg-charcoal text-white px-10 py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-charcoal/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Form>
    </div>
  )
}
