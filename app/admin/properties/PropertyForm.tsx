"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { upsertPropertyAction } from "./actions"
import { PropertyStatus } from "@prisma/client"

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(3),
  address: z.string().optional(),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  maxGuests: z.number().min(1),
  pricePerNight: z.number().min(0),

  status: z.nativeEnum(PropertyStatus),
  ownerId: z.string().min(1),
})

type PropertyFormValues = z.infer<typeof schema>
type PropertyFormInitialData = Omit<Partial<PropertyFormValues>, "address" | "pricePerNight"> & {
  id?: string
  address?: string | null
  pricePerNight?: number | { toString(): string } | null
}

export function PropertyForm({
  owners,
  initialData,
}: {
  owners: { id: string, name: string | null, email: string }[];
  initialData?: PropertyFormInitialData;
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      address: initialData?.address || "",
      bedrooms: initialData?.bedrooms || 0,
      bathrooms: initialData?.bathrooms || 0,
      maxGuests: initialData?.maxGuests || 1,
      pricePerNight: initialData?.pricePerNight ? Number(initialData.pricePerNight) : 0,

      status: initialData?.status || "DRAFT",
      ownerId: initialData?.ownerId || "",
    }
  })

  async function onSubmit(data: PropertyFormValues) {
    setIsPending(true)
    setError(null)
    const res = await upsertPropertyAction(data, initialData?.id)
    if (res.error) {
      setError(res.error)
      setIsPending(false)
    } else {
      // Redirect to images page to complete setup
      router.push(`/admin/properties/${res.id}/images`)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {error && <div className="text-red-500 bg-red-50 p-4 rounded-md">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="slug" render={({ field }) => (
            <FormItem><FormLabel>Slug (URL)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea className="min-h-[150px]" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="location" render={({ field }) => (
            <FormItem><FormLabel>City / General Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="address" render={({ field }) => (
            <FormItem><FormLabel>Full Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField control={form.control} name="bedrooms" render={({ field }) => (
            <FormItem><FormLabel>Bedrooms</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="bathrooms" render={({ field }) => (
            <FormItem><FormLabel>Bathrooms</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="maxGuests" render={({ field }) => (
            <FormItem><FormLabel>Max Guests</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="pricePerNight" render={({ field }) => (
            <FormItem><FormLabel>Price Per Night ($)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="ownerId" render={({ field }) => (
            <FormItem>
              <FormLabel>Assign Owner</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select an owner" /></SelectTrigger></FormControl>
                <SelectContent>
                  {owners.map(owner => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.name || owner.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <Button type="submit" className="bg-navy text-cream w-full" disabled={isPending}>
          {isPending ? "Saving..." : initialData ? "Update Property" : "Create Property & Add Images"}
        </Button>
      </form>
    </Form>
  )
}
