"use client"

import { useState, useTransition } from "react"
import { ServerDataTable, ColumnDef } from "@/components/admin/server-data-table"
import { BulkActionBar } from "@/components/admin/bulk-action-bar"
import {
  MoreHorizontal,
  ShieldBan,
  RefreshCw,
  Eye,
  Trash2,
  ShieldCheck,
  ShieldOff,
  UserX,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toggleUserStatusAction, deleteUserAction } from "./actions"
import { bulkSuspendUsersAction, bulkRestoreUsersAction, bulkDeleteUsersAction } from "./bulk-actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type UserRow = {
  id: string
  name: string | null
  email: string
  role: string
  status: string
  image: string | null
  createdAt: Date | string
}

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-amber-50 text-amber-600 border-amber-200/50",
  OWNER: "bg-violet-50 text-violet-600 border-violet-200/50",
  GUEST: "bg-sky-50 text-sky-600 border-sky-200/50",
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-600 border-emerald-200/50",
  SUSPENDED: "bg-rose-50 text-rose-500 border-rose-200/50",
}

interface UsersTableProps {
  users: UserRow[]
  currentUser?: { email?: string | null; id?: string }
  total: number
  page: number
  pageSize: number
  sort: string
  order: "asc" | "desc"
  searchValue: string
}

export function UsersTable({
  users,
  currentUser,
  total,
  page,
  pageSize,
  sort,
  order,
  searchValue,
}: UsersTableProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const isMasterAdmin = currentUser?.email === "admin@saltroutegroup.com"

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const isSuspend = currentStatus === "ACTIVE"
    if (!confirm(`Are you sure you want to ${isSuspend ? "suspend" : "restore"} this user?`)) return
    const res = await toggleUserStatusAction(userId, isSuspend ? "SUSPENDED" : "ACTIVE")
    if (res.error) toast.error(res.error)
    else {
      toast.success(`User ${isSuspend ? "suspended" : "restored"}`)
      router.refresh()
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("PERMANENT DELETION: This cannot be undone.")) return
    const res = await deleteUserAction(userId)
    if (res.error) toast.error(res.error)
    else {
      toast.success("User deleted")
      router.refresh()
    }
  }

  const handleBulkSuspend = () => {
    if (!confirm(`Suspend ${selectedIds.length} users?`)) return
    startTransition(async () => {
      const res = await bulkSuspendUsersAction(selectedIds)
      if (res.error) toast.error(res.error)
      else {
        toast.success(`${res.count} users suspended`)
        setSelectedIds([])
        router.refresh()
      }
    })
  }

  const handleBulkRestore = () => {
    if (!confirm(`Restore ${selectedIds.length} users?`)) return
    startTransition(async () => {
      const res = await bulkRestoreUsersAction(selectedIds)
      if (res.error) toast.error(res.error)
      else {
        toast.success(`${res.count} users restored`)
        setSelectedIds([])
        router.refresh()
      }
    })
  }

  const handleBulkDelete = () => {
    if (!confirm(`PERMANENTLY DELETE ${selectedIds.length} users? This cannot be undone.`)) return
    startTransition(async () => {
      const res = await bulkDeleteUsersAction(selectedIds)
      if (res.error) toast.error(res.error)
      else {
        toast.success(`${res.count} users deleted`)
        setSelectedIds([])
        router.refresh()
      }
    })
  }

  const columns: ColumnDef<UserRow>[] = [
    {
      id: "name",
      header: "Profile",
      enableSorting: false,
      cell: ({ row }) => {
        const u = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-navy/[0.05] flex items-center justify-center overflow-hidden border border-navy/10 shrink-0">
              {u.image ? (
                <img src={u.image} alt={u.name || ""} className="h-full w-full object-cover" />
              ) : (
                <span className="text-gold text-xs font-bold">
                  {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                </span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-navy text-xs truncate">{u.name || "N/A"}</span>
              <span className="text-[10px] text-navy/40 font-light mt-0.5 truncate">{u.email}</span>
            </div>
          </div>
        )
      },
    },
    {
      id: "role",
      header: "Role",
      cell: ({ row }) => (
        <span
          className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
            ROLE_STYLES[row.original.role] || "bg-slate-50 text-slate-500 border-slate-200"
          }`}
        >
          {row.original.role}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
            STATUS_STYLES[row.original.status] || "bg-slate-50 text-slate-500 border-slate-200"
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-[10px] text-navy/40">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const u = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gold/10 hover:text-gold transition-colors focus-visible:outline-none">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-[#1B3A5C]/10 bg-[#FFFDF8] p-1.5 text-[#1B3A5C]">
              <DropdownMenuLabel className="text-[10px] text-navy/30 uppercase tracking-widest font-semibold px-2.5 py-1.5">Manage</DropdownMenuLabel>
              <DropdownMenuItem className="rounded-lg text-xs font-light px-2.5 py-2 hover:bg-navy/5 cursor-pointer flex items-center gap-2" onClick={() => router.push(`/admin/users/${u.id}`)}>
                <Eye className="w-3.5 h-3.5 opacity-60" /> View Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-navy/5" />
              <DropdownMenuItem className="rounded-lg text-xs font-light px-2.5 py-2 hover:bg-navy/5 cursor-pointer flex items-center gap-2" onClick={() => handleToggleStatus(u.id, u.status)}>
                {u.status !== "SUSPENDED" ? (
                  <span className="flex items-center gap-2 text-rose-600">
                    <ShieldBan className="w-3.5 h-3.5 opacity-60" /> Suspend User
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-emerald-600">
                    <RefreshCw className="w-3.5 h-3.5 opacity-60" /> Restore User
                  </span>
                )}
              </DropdownMenuItem>
              {isMasterAdmin && (
                <DropdownMenuItem className="rounded-lg text-xs font-light px-2.5 py-2 hover:bg-rose-50 text-rose-600 focus:text-rose-600 cursor-pointer flex items-center gap-2" onClick={() => handleDeleteUser(u.id)}>
                  <Trash2 className="w-3.5 h-3.5 opacity-60" /> Delete Permanently
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const bulkActions = [
    {
      label: "Suspend",
      icon: <ShieldOff className="h-3.5 w-3.5" />,
      onClick: handleBulkSuspend,
    },
    {
      label: "Restore",
      icon: <ShieldCheck className="h-3.5 w-3.5" />,
      onClick: handleBulkRestore,
    },
    ...(isMasterAdmin
      ? [
          {
            label: "Delete",
            icon: <UserX className="h-3.5 w-3.5" />,
            variant: "danger" as const,
            onClick: handleBulkDelete,
          },
        ]
      : []),
  ]

  return (
    <ServerDataTable
      data={users}
      columns={columns}
      total={total}
      page={page}
      pageSize={pageSize}
      sort={sort}
      order={order}
      searchValue={searchValue}
      searchPlaceholder="Search by name or email..."
      emptyMessage="No users found."
      getRowId={(row) => row.id}
      selectedIds={selectedIds}
      onSelectionChange={setSelectedIds}
      bulkActionBar={
        <BulkActionBar
          selectedCount={selectedIds.length}
          actions={bulkActions}
          onClearSelection={() => setSelectedIds([])}
        />
      }
    />
  )
}
