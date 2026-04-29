import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { createAuditLog } from "@/lib/audit"

export const dynamic = "force-dynamic"

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v)
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ].join("\n")
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { entity } = await params
  const sp = req.nextUrl.searchParams

  let rows: Record<string, unknown>[] = []
  const filename = `${entity}-export-${new Date().toISOString().slice(0, 10)}.csv`

  const idsParam = sp.get("ids")
  const ids = idsParam ? idsParam.split(",").filter(Boolean) : undefined

  if (entity === "users") {
    const role = sp.get("role")
    const q = sp.get("q") || ""
    const users = await prisma.user.findMany({
      where: {
        ...(ids ? { id: { in: ids } } : {}),
        ...(role && role !== "ALL" ? { role: role as never } : {}),
        ...(q ? { OR: [{ email: { contains: q } }, { name: { contains: q } }] } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })
    rows = users.map((u) => ({
      id: u.id,
      name: u.name ?? "",
      email: u.email,
      role: u.role,
      status: u.status,
      joined: u.createdAt.toISOString(),
    }))
  } else if (entity === "bookings") {
    const status = sp.get("status")
    const from = sp.get("from")
    const to = sp.get("to")
    const bookings = await prisma.booking.findMany({
      where: {
        ...(ids ? { id: { in: ids } } : {}),
        ...(status && status !== "ALL" ? { status: status as never } : {}),
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      include: {
        guest: { select: { name: true, email: true } },
        property: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    rows = bookings.map((b) => ({
      bookingCode: b.bookingCode,
      guestName: b.guest.name ?? "",
      guestEmail: b.guest.email ?? "",
      property: b.property.title,
      checkIn: b.checkIn.toISOString().slice(0, 10),
      checkOut: b.checkOut.toISOString().slice(0, 10),
      guests: b.guests,
      totalPrice: Number(b.totalPrice),
      status: b.status,
      createdAt: b.createdAt.toISOString(),
    }))
  } else if (entity === "inquiries") {
    const status = sp.get("status")
    const inquiries = await prisma.inquiry.findMany({
      where: {
        ...(ids ? { id: { in: ids } } : {}),
        ...(status && status !== "ALL" ? { status: status as never } : {}),
      },
      orderBy: { createdAt: "desc" },
    })
    rows = inquiries.map((i) => ({
      id: i.id,
      name: i.name,
      email: i.email,
      subject: i.subject,
      status: i.status,
      createdAt: i.createdAt.toISOString(),
    }))
  } else if (entity === "reviews") {
    const filter = sp.get("filter")
    const reviews = await prisma.review.findMany({
      where: {
        ...(ids ? { id: { in: ids } } : {}),
        ...(filter && filter !== "ALL" ? { status: filter as never } : {}),
      },
      include: {
        guest: { select: { name: true, email: true } },
        property: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    rows = reviews.map((r) => ({
      id: r.id,
      guestName: r.guest.name ?? "",
      guestEmail: r.guest.email ?? "",
      property: r.property.title,
      rating: r.rating,
      status: r.status,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    }))
  } else if (entity === "properties") {
    const status = sp.get("status")
    const q = sp.get("q") || ""
    const props = await prisma.property.findMany({
      where: {
        ...(ids ? { id: { in: ids } } : {}),
        ...(status && status !== "ALL" ? { status: status as never } : {}),
        ...(q ? { OR: [{ title: { contains: q } }, { location: { contains: q } }] } : {}),
      },
      include: { owner: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    })
    rows = props.map((p) => ({
      id: p.id,
      title: p.title,
      location: p.location,
      status: p.status,
      pricePerNight: Number(p.pricePerNight),
      ownerName: p.owner.name ?? "",
      ownerEmail: p.owner.email,
      createdAt: p.createdAt.toISOString(),
    }))
  } else {
    return new NextResponse("Unknown entity", { status: 400 })
  }

  await createAuditLog({
    action: "EXPORT",
    entity: entity.toUpperCase(),
    userId: session.user.id,
    details: { count: rows.length, entity },
  })

  const csv = toCsv(rows)
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
