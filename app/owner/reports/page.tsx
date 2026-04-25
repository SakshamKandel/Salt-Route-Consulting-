import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Banknote, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatNpr } from "@/lib/currency"

export default async function OwnerReportsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  // Generate mock aggregate data for demonstration since we don't have a complex charting library installed by default
  const totalRevenue = await prisma.booking.aggregate({
    where: { property: { ownerId: session.user.id }, status: "CONFIRMED" },
    _sum: { totalPrice: true }
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display text-navy">Performance Reports</h2>
          <p className="text-slate-500">Track revenue, occupancy, and property metrics.</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (YTD)</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{formatNpr(totalRevenue._sum.totalPrice)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white border rounded-lg p-12 text-center shadow-sm">
        <BarChart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">Detailed monthly charts and occupancy metrics will appear here.</p>
      </div>
    </div>
  )
}
