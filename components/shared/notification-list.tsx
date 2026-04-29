"use client"

import { Bell, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { markAllCurrentUserNotificationsReadAction, markNotificationReadAction } from "@/app/notifications/actions"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

type NotificationRow = {
  id: string
  title: string
  body: string
  href: string | null
  readAt: Date | string | null
  createdAt: Date | string
}

export function NotificationList({ notifications }: { notifications: NotificationRow[] }) {
  const unreadCount = notifications.filter((notification) => !notification.readAt).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-navy/40 text-[10px] uppercase font-bold tracking-widest">
          {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
        </p>
        {unreadCount > 0 && (
          <form action={async () => {
            await markAllCurrentUserNotificationsReadAction()
          }}>
            <Button type="submit" variant="outline" className="text-[10px] font-semibold uppercase tracking-widest h-8 px-3">
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 opacity-60" />
              Mark all read
            </Button>
          </form>
        )}
      </div>

      <div className="rounded-2xl border border-[#1B3A5C]/8 bg-[#FFFDF8] overflow-hidden divide-y divide-[#1B3A5C]/5">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Bell className="h-6 w-6 text-navy/20 mb-3" />
            <p className="text-xs text-navy/40 font-light">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "flex items-start gap-4 p-5 transition-colors",
                !notification.readAt ? "bg-gold/5" : "hover:bg-navy/[0.01]"
              )}
            >
              <div className={cn(
                "mt-0.5 flex h-7 w-7 items-center justify-center rounded-xl border shrink-0",
                !notification.readAt 
                  ? "bg-gold/10 border-gold/20 text-gold" 
                  : "bg-navy/5 border-navy/5 text-navy/40"
              )}>
                <Bell className="h-3.5 w-3.5" />
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-semibold text-navy leading-none">
                    {notification.title}
                  </p>
                  <p className="shrink-0 text-[10px] text-navy/40 font-light">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <p className="text-navy/60 text-xs font-light mt-1.5 leading-relaxed">
                  {notification.body}
                </p>
                
                {!notification.readAt && (
                  <form 
                    className="mt-2"
                    action={async () => {
                      await markNotificationReadAction(notification.id)
                    }}
                  >
                    <button
                      className="text-[10px] text-gold font-semibold uppercase tracking-widest hover:underline"
                      type="submit"
                    >
                      Mark as read
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
