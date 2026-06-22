"use client"

import { useState } from "react"
import {
  AlertTriangle,
  Building2,
  CalendarX,
  DollarSign,
  LayoutList,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react"
import {
  deleteAllPropertiesAction,
  deleteAllBookingsAction,
  resetAllFinancesAction,
  deleteAllSectionsAction,
} from "./data-actions"

type Counts = {
  properties: number
  bookings: number
  sections: number
  revenue: number
}

type ActionResult = { success: true; count: number } | { error: string }

type Item = {
  key: string
  icon: typeof Building2
  title: string
  desc: string
  count: number
  countLabel: string
  /** Extra warning shown inside the confirm dialog. */
  cascade?: string
  verb: string
  run: (confirmation: string) => Promise<ActionResult>
}

const CONFIRM_PHRASE = "DELETE"
const navy = "#1B3A5C"

function formatNpr(n: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)
}

export function DataManagementSection({ counts }: { counts: Counts }) {
  const [active, setActive] = useState<Item | null>(null)
  const [typed, setTyped] = useState("")
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  const items: Item[] = [
    {
      key: "bookings",
      icon: CalendarX,
      title: "Delete all bookings",
      desc: "Removes every reservation — manual and bulk alike.",
      count: counts.bookings,
      countLabel: "bookings",
      cascade: "This clears all revenue figures too, since finances are calculated from booking totals.",
      verb: "Delete bookings",
      run: deleteAllBookingsAction,
    },
    {
      key: "finances",
      icon: DollarSign,
      title: "Reset financial figures",
      desc: "Zeroes every booking total so revenue, payments and earnings read 0 — reservations are kept.",
      count: counts.revenue,
      countLabel: "total revenue (NPR)",
      cascade: "Booking records stay; only their prices are set to 0. Use “Delete all bookings” to remove the reservations entirely.",
      verb: "Reset finances",
      run: resetAllFinancesAction,
    },
    {
      key: "sections",
      icon: LayoutList,
      title: "Delete all property sections",
      desc: "Removes the custom content sections shown on property detail pages.",
      count: counts.sections,
      countLabel: "sections",
      verb: "Delete sections",
      run: deleteAllSectionsAction,
    },
    {
      key: "properties",
      icon: Building2,
      title: "Delete all properties",
      desc: "Removes every property and all of its data.",
      count: counts.properties,
      countLabel: "properties",
      cascade:
        "This also deletes all images, room types, sections, blocked dates, bookings and reviews belonging to those properties. This is the most destructive action.",
      verb: "Delete properties",
      run: deleteAllPropertiesAction,
    },
  ]

  function open(item: Item) {
    setActive(item)
    setTyped("")
    setResult(null)
  }

  function close() {
    if (busy) return
    setActive(null)
    setTyped("")
  }

  async function confirm() {
    if (!active) return
    setBusy(true)
    setResult(null)
    const res = await active.run(typed)
    setBusy(false)
    if ("error" in res) {
      setResult({ type: "error", msg: res.error })
    } else {
      setResult({
        type: "success",
        msg: `Done — ${res.count} ${active.countLabel.replace(/\s*\(NPR\)/, "")} affected. Refresh to see updated totals.`,
      })
      setActive(null)
      setTyped("")
    }
  }

  return (
    <div className="bg-white border border-red-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-red-100 bg-red-50/60">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <div>
          <p className="text-sm font-semibold text-red-700">Danger Zone — Data Management</p>
          <p className="text-xs text-red-400">
            Permanently remove data. These actions cannot be undone.
          </p>
        </div>
      </div>

      {result && (
        <div className="px-5 pt-4">
          {result.type === "success" ? (
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm">
              <CheckCircle className="h-4 w-4 shrink-0" />
              {result.msg}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {result.msg}
            </div>
          )}
        </div>
      )}

      <div className="p-5 space-y-3">
        {items.map((item) => {
          const Icon = item.icon
          const empty = item.count === 0
          return (
            <div
              key={item.key}
              className="flex items-center gap-4 rounded-lg border border-slate-200 px-4 py-3"
            >
              <Icon className="h-5 w-5 text-slate-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {item.key === "finances"
                    ? `NPR ${formatNpr(item.count)} on the books`
                    : `${item.count} ${item.countLabel}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => open(item)}
                disabled={empty && item.key !== "finances"}
                className="h-9 px-4 rounded-lg border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {item.verb}
              </button>
            </div>
          )
        })}
      </div>

      {active && (
        <ConfirmDialog
          item={active}
          typed={typed}
          setTyped={setTyped}
          busy={busy}
          onCancel={close}
          onConfirm={confirm}
        />
      )}
    </div>
  )
}

function ConfirmDialog({
  item,
  typed,
  setTyped,
  busy,
  onCancel,
  onConfirm,
}: {
  item: Item
  typed: string
  setTyped: (v: string) => void
  busy: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  const ready = typed.trim().toUpperCase() === CONFIRM_PHRASE
  const Icon = item.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50">
              <Icon className="h-4.5 w-4.5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{item.title}</p>
              <p className="text-xs text-slate-400">This cannot be undone</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="text-slate-300 hover:text-slate-500 transition-colors disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-slate-600">
            You are about to affect{" "}
            <span className="font-semibold text-slate-800">
              {item.key === "finances"
                ? `NPR ${formatNpr(item.count)} across all bookings`
                : `${item.count} ${item.countLabel}`}
            </span>
            .
          </p>
          {item.cascade && (
            <div className="flex gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">{item.cascade}</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Type <span className="font-mono text-red-600">{CONFIRM_PHRASE}</span> to confirm
            </label>
            <input
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && ready && !busy) onConfirm()
              }}
              placeholder={CONFIRM_PHRASE}
              disabled={busy}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 disabled:bg-slate-50"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="h-9 px-4 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!ready || busy}
            className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy ? "Working…" : item.verb}
          </button>
        </div>
      </div>
    </div>
  )
}
