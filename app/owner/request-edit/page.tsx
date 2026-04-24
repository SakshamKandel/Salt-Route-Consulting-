import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { submitOwnerRequestAction } from "./actions"

export default async function OwnerRequestEditPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  const resolvedParams = await searchParams
  const defaultPropertyId = resolvedParams.propertyId as string

  const properties = await prisma.property.findMany({
    where: { ownerId: session.user.id },
    select: { id: true, title: true }
  })

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-3xl font-display text-navy">Request an Edit</h2>
        <p className="text-slate-500">Need to block dates, change pricing, or update property details? Send a request to our admin team.</p>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <form action={async (formData) => {
          "use server"
          const res = await submitOwnerRequestAction(formData)
          if (res.success) {
            redirect("/owner/dashboard?requestSubmitted=true")
          }
        }} className="space-y-6">
          
          <div>
            <label className="text-sm font-medium mb-1 block">Select Property</label>
            <select name="propertyId" defaultValue={defaultPropertyId || ""} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="" disabled>Select a property...</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Type of Change</label>
            <select name="requestType" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="Calendar Block">Block Calendar Dates</option>
              <option value="Price Change">Update Pricing</option>
              <option value="Update Images">Update Images</option>
              <option value="Other">Other Edit</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Message / Details</label>
            <textarea 
              name="message" 
              required 
              rows={5}
              placeholder="E.g., Please block the dates from Oct 10 to Oct 15 as I will be using the property myself."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <Button type="submit" className="w-full bg-navy text-cream">Submit Request</Button>
        </form>
      </div>
    </div>
  )
}
