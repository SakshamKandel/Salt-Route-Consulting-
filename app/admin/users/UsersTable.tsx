"use client"
import { DataTable, Column } from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, ShieldBan, RefreshCw, Eye, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type UserTableRow = {
  id: string
  name: string | null
  email: string
  role: string
  status: string
  image: string | null
  createdAt: Date | string
}

import { toggleUserStatusAction, deleteUserAction } from "./actions"
import { UserStatus } from "@prisma/client"
import { useRouter } from "next/navigation"

export function UsersTable({ 
  users, 
  currentUser 
}: { 
  users: UserTableRow[]; 
  currentUser?: { email?: string | null } 
}) {
  const router = useRouter()
  const isMasterAdmin = currentUser?.email === "admin@saltroutegroup.com"

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus: UserStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
    if (confirm(`Are you sure you want to ${newStatus.toLowerCase()} this user?`)) {
      const res = await toggleUserStatusAction(userId, newStatus)
      if (res.error) alert(res.error)
      else router.refresh()
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm("PERMANENT DELETION: Are you absolutely sure? This will delete all user data and properties. This cannot be undone.")) {
      const res = await deleteUserAction(userId)
      if (res.error) alert(res.error)
      else router.refresh()
    }
  }

  const columns: Column<UserTableRow>[] = [
    {
      header: "Profile",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
            {row.image ? (
              <img src={row.image} alt={row.name || ""} className="h-full w-full object-cover" />
            ) : (
              <span className="text-slate-400 text-xs font-bold">
                {row.name ? row.name.charAt(0).toUpperCase() : "U"}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-navy">{row.name || "N/A"}</span>
            <span className="text-xs text-slate-500 md:hidden">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Role",
      cell: (row) => (
        <Badge
          variant={
            row.role === "ADMIN"
              ? "destructive"
              : row.role === "OWNER"
              ? "default"
              : "secondary"
          }
        >
          {row.role}
        </Badge>
      ),
    },
    {
      header: "Status",
      cell: (row) => (
        <Badge
          variant={
            row.status === "ACTIVE"
              ? "default"
              : row.status === "SUSPENDED"
              ? "destructive"
              : "outline"
          }
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Joined",
      cell: (row) => (
        <span className="text-sm">{new Date(row.createdAt).toLocaleDateString()}</span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent focus-visible:outline-none">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => { window.location.href = `/admin/users/${row.id}` }}>
              <Eye className="w-4 h-4" /> View Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleToggleStatus(row.id, row.status)}>
              {row.status !== "SUSPENDED" ? (
                <span className="flex items-center gap-2 text-red-600 w-full cursor-pointer">
                  <ShieldBan className="w-4 h-4" /> Suspend User
                </span>
              ) : (
                <span className="flex items-center gap-2 text-green-600 w-full cursor-pointer">
                  <RefreshCw className="w-4 h-4" /> Restore User
                </span>
              )}
            </DropdownMenuItem>
            
            {isMasterAdmin && (
              <DropdownMenuItem variant="destructive" onClick={() => handleDeleteUser(row.id)}>
                <span className="flex items-center gap-2 w-full cursor-pointer font-medium">
                  <Trash2 className="w-4 h-4" /> Delete Permanently
                </span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <DataTable
      data={users}
      columns={columns}
      searchKey="email"
      searchPlaceholder="Search users by email..."
    />
  )
}
