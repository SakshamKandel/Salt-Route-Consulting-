import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { MessageSquare } from "lucide-react"

export default async function OwnerMessagesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div>
        <h2 className="text-3xl font-display text-navy">Messages & Announcements</h2>
        <p className="text-slate-500">Communications from the Salt Route administrative team.</p>
      </div>

      <div className="flex-1 bg-white border rounded-lg shadow-sm flex overflow-hidden">
        <div className="w-1/3 border-r flex flex-col">
          <div className="p-4 border-b bg-slate-50 font-semibold text-navy">Inbox</div>
          <div className="flex-1 overflow-y-auto">
            {/* Example Broadcast */}
            <div className="p-4 border-b hover:bg-slate-50 cursor-pointer bg-blue-50/50">
              <h4 className="font-semibold text-sm text-navy">Platform Update: New Reports</h4>
              <p className="text-xs text-slate-500 truncate mt-1">We have just launched the new reporting dashboard...</p>
              <p className="text-[10px] text-slate-400 mt-2">Today</p>
            </div>
            <div className="p-4 border-b hover:bg-slate-50 cursor-pointer">
              <h4 className="font-semibold text-sm text-navy">Holiday Season Preparation</h4>
              <p className="text-xs text-slate-500 truncate mt-1">Please ensure your property calendars are up to date...</p>
              <p className="text-[10px] text-slate-400 mt-2">Last Week</p>
            </div>
          </div>
        </div>
        <div className="w-2/3 p-8 flex flex-col items-center justify-center text-center text-slate-400">
          <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
          <p>Select a message to read its full contents.</p>
        </div>
      </div>
    </div>
  )
}
