import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-[#1B3A5C]/10 bg-[#F9F7F2] px-3.5 py-1 text-[#1B3A5C] text-sm transition-colors outline-none",
        "placeholder:text-[#1B3A5C]/30",
        "focus-visible:border-[#C9A96E] focus-visible:ring-3 focus-visible:ring-[#C9A96E]/30",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F5F1E8]",
        "aria-invalid:border-[#B84040] aria-invalid:ring-3 aria-invalid:ring-[#B84040]/15",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#1B3A5C]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
