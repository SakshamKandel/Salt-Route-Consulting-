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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">{unreadCount} unread notification{unreadCount === 1 ? "" : "s"}</p>
        </div>
        {unreadCount > 0 && (
          <form action={async () => {
            "use server"
            await markAllCurrentUserNotificationsReadAction()
          }}>
            <Button type="submit" variant="outline" size="sm">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
          </form>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-2 p-4 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex items-start space-x-4 p-4 transition-colors hover:bg-muted/50",
                  !notification.readAt && "bg-blue-50/30"
                )}
              >
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.body}
                  </p>
                  {!notification.readAt && (
                    <form action={async () => {
                      "use server"
                      await markNotificationReadAction(notification.id)
                    }}>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs text-blue-600"
                        type="submit"
                      >
                        Mark as read
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
