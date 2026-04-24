"use client"
import { DataTable, Column } from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MoreHorizontal, ShieldBan, RefreshCw, Eye } from "lucide-react"
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
  createdAt: Date | string
}

export function UsersTable({ users }: { users: UserTableRow[] }) {
  const columns: Column<UserTableRow>[] = [
    {
      header: "Name",
      cell: (row) => <span className="font-medium">{row.name || "N/A"}</span>,
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
            <DropdownMenuItem>
              <Link href={`/admin/users/${row.id}`} className="flex items-center gap-2 w-full">
                <Eye className="w-4 h-4" /> View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span className="flex items-center gap-2 text-amber-600 w-full">
                <RefreshCw className="w-4 h-4" /> Reset Password
              </span>
            </DropdownMenuItem>
            {row.status !== "SUSPENDED" ? (
              <DropdownMenuItem variant="destructive">
                <span className="flex items-center gap-2 w-full">
                  <ShieldBan className="w-4 h-4" /> Suspend User
                </span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem>
                <span className="flex items-center gap-2 text-green-600 w-full">
                  <ShieldBan className="w-4 h-4" /> Unsuspend User
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
