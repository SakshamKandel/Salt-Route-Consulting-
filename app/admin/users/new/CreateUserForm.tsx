"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createUserAction } from "./actions"

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(20).optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  role: z.enum(["GUEST", "OWNER", "ADMIN"]),
})

type FormValues = z.infer<typeof schema>

export function CreateUserForm({ defaultRole = "GUEST" }: { defaultRole?: "GUEST" | "OWNER" | "ADMIN" }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: defaultRole,
    },
  })

  async function onSubmit(data: FormValues) {
    setIsPending(true)
    setError(null)
    const res = await createUserAction({ ...data, phone: data.phone || "" })
    if (res.error) {
      setError(res.error)
      setIsPending(false)
      return
    }
    const dest = res.role === "OWNER" ? "/admin/owners" : "/admin/users"
    router.push(dest)
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && <div className="text-red-600 bg-red-50 border border-red-200 p-3 rounded-md text-sm">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl><Input {...field} placeholder="Jane Doe" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" {...field} placeholder="user@example.com" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (optional)</FormLabel>
              <FormControl><Input {...field} placeholder="+977-..." /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="role" render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="GUEST">Guest</SelectItem>
                  <SelectItem value="OWNER">Owner</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Initial Password</FormLabel>
            <FormControl><Input type="password" {...field} placeholder="At least 8 chars, 1 upper, 1 lower, 1 number" /></FormControl>
            <p className="text-xs text-slate-500 mt-1">The user can change this after their first login.</p>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" className="bg-navy text-cream w-full" disabled={isPending}>
          {isPending ? "Creating..." : "Create User"}
        </Button>
      </form>
    </Form>
  )
}
