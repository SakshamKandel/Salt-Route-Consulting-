"use client"

import { X } from "lucide-react"

interface BulkAction {
  label: string
  icon?: React.ReactNode
  variant?: "default" | "danger"
  onClick: () => void
}

interface BulkActionBarProps {
  selectedCount: number
  actions: BulkAction[]
  onClearSelection: () => void
}

export function BulkActionBar({ selectedCount, actions, onClearSelection }: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex items-center gap-2.5 bg-[#1B3A5C] text-white rounded-lg px-3.5 py-2 text-sm">
      <button
        type="button"
        onClick={onClearSelection}
        className="text-white/50 hover:text-white transition-colors"
        aria-label="Clear selection"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <span className="font-medium text-sm text-white/90">{selectedCount} selected</span>
      <div className="h-4 w-px bg-white/20" />
      <div className="flex items-center gap-1.5">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              action.variant === "danger"
                ? "bg-red-500 hover:bg-red-400 text-white"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            {action.icon && <span>{action.icon}</span>}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}
