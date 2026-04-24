"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

type NotificationPreferences = {
  marketing: boolean
  bookingUpdates: boolean
  promotions: boolean
}

const defaultPreferences: NotificationPreferences = {
  marketing: false,
  bookingUpdates: true,
  promotions: false,
}

export default function NotificationsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    let cancelled = false

    queueMicrotask(() => {
      const saved = localStorage.getItem("salt_route_notifications")
      if (saved && !cancelled) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(saved) })
      }
      if (!cancelled) setMounted(true)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = () => {
    localStorage.setItem("salt_route_notifications", JSON.stringify(preferences))
    alert("Notification preferences saved successfully.")
  }

  if (!mounted) return null

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-display text-navy">Notifications</h1>

      <Card>
        <CardHeader>
          <CardTitle>Email Preferences</CardTitle>
          <CardDescription>Manage what emails you receive from us.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-navy">Booking Updates</p>
              <p className="text-sm text-gray-500">Receive emails about your bookings, confirmations, and reminders.</p>
            </div>
            <Switch 
              checked={preferences.bookingUpdates} 
              onCheckedChange={() => handleToggle('bookingUpdates')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-navy">Promotional Offers</p>
              <p className="text-sm text-gray-500">Receive special offers, discounts, and last-minute deals.</p>
            </div>
            <Switch 
              checked={preferences.promotions} 
              onCheckedChange={() => handleToggle('promotions')} 
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-navy">Marketing & Newsletter</p>
              <p className="text-sm text-gray-500">Receive our monthly newsletter with travel inspiration.</p>
            </div>
            <Switch 
              checked={preferences.marketing} 
              onCheckedChange={() => handleToggle('marketing')} 
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="bg-navy text-cream">Save Preferences</Button>
    </div>
  )
}
