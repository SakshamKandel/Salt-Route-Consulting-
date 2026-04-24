"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary"
import { updateProfileAction } from "./actions"
import Image from "next/image"
import { useSession } from "next-auth/react"

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
      // Update client session data without a full page reload
      await update({ name: data.name, image: data.image })
    }
    setIsPending(false)
  }

  return (
    <div className="space-y-6">
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert className="bg-green-50 text-green-700 border-green-200"><AlertDescription>{success}</AlertDescription></Alert>}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm">
              {imageUrl ? (
                <Image src={imageUrl} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
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
                <Button type="button" variant="outline" onClick={() => open()}>
                  Upload Avatar
                </Button>
              )}
            </CldUploadWidget>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl><Input placeholder="Your Name" {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl><Input placeholder="+1 234 567 890" {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="bg-navy text-cream" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
