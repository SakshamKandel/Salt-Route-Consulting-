"use client"

import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { Input } from "./input"
import { cn } from "@/lib/utils"

interface NumberInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value" | "type"> {
  value?: number
  min?: number
  max?: number
  step?: number
  onChange?: (value: number) => void
  buttonClassName?: string
  containerClassName?: string
}

function NumberInput({
  value: controlledValue = 0,
  min,
  max,
  step = 1,
  onChange,
  className,
  buttonClassName,
  containerClassName,
  ...props
}: NumberInputProps) {
  const [rawValue, setRawValue] = React.useState(String(controlledValue))

  // Sync rawValue when the controlled value changes (from +/- buttons or parent)
  React.useEffect(() => {
    setRawValue(String(controlledValue))
  }, [controlledValue])

  const clamp = (v: number) => {
    if (min !== undefined && v < min) return min
    if (max !== undefined && v > max) return v
    return v
  }

  const commitValue = (v: number) => {
    const clamped = clamp(v)
    onChange?.(clamped)
  }

  const increment = () => {
    const next = clamp(Number(controlledValue) + step)
    onChange?.(next)
  }

  const decrement = () => {
    const next = clamp(Number(controlledValue) - step)
    onChange?.(next)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    // Allow empty string so backspace works freely
    if (text === "" || text === "-") {
      setRawValue(text)
      return
    }
    // Allow only numeric characters (including one decimal point if step < 1)
    const isValid = step < 1 ? /^-?\d*\.?\d*$/ : /^-?\d*$/
    if (!isValid.test(text)) return
    setRawValue(text)

    const parsed = step < 1 ? parseFloat(text) : parseInt(text, 10)
    if (!Number.isNaN(parsed)) {
      commitValue(parsed)
    }
  }

  const handleBlur = () => {
    const parsed = step < 1 ? parseFloat(rawValue) : parseInt(rawValue, 10)
    if (Number.isNaN(parsed)) {
      // Reset to controlled value on invalid input
      setRawValue(String(controlledValue))
    } else {
      const clamped = clamp(parsed)
      onChange?.(clamped)
      setRawValue(String(clamped))
    }
  }

  return (
    <div className={cn("relative flex items-center", containerClassName)}>
      <Input
        type="text"
        inputMode="numeric"
        value={rawValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn("pr-16", className)}
        {...props}
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
        <button
          type="button"
          onClick={decrement}
          disabled={min !== undefined && Number(controlledValue) <= min}
          className={cn(
            "h-7 w-7 inline-flex items-center justify-center rounded-md text-[#1B3A5C]/50 hover:bg-[#1B3A5C]/5 hover:text-[#1B3A5C] disabled:opacity-30 disabled:pointer-events-none transition-colors",
            buttonClassName
          )}
          aria-label="Decrease"
        >
          <Minus className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={increment}
          disabled={max !== undefined && Number(controlledValue) >= max}
          className={cn(
            "h-7 w-7 inline-flex items-center justify-center rounded-md text-[#1B3A5C]/50 hover:bg-[#1B3A5C]/5 hover:text-[#1B3A5C] disabled:opacity-30 disabled:pointer-events-none transition-colors",
            buttonClassName
          )}
          aria-label="Increase"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

export { NumberInput }
