import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:border-[#C9A96E] focus-visible:ring-3 focus-visible:ring-[#C9A96E]/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-[#B84040] aria-invalid:ring-3 aria-invalid:ring-[#B84040]/15 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#1B3A5C] text-[#FFFDF8] hover:bg-[#2A4F7A]",
        outline:
          "border-[#1B3A5C]/15 bg-[#FFFDF8] text-[#1B3A5C] hover:bg-[#F5F1E8] hover:border-[#1B3A5C]/25",
        secondary:
          "bg-[#F5F1E8] text-[#1B3A5C] hover:bg-[#F0EBE0]",
        ghost:
          "text-[#1B3A5C]/70 hover:bg-[#F5F1E8] hover:text-[#1B3A5C]",
        destructive:
          "bg-[#B84040]/10 text-[#B84040] hover:bg-[#B84040]/20 focus-visible:border-[#B84040]/40 focus-visible:ring-[#B84040]/20",
        link: "text-[#1B3A5C] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-[min(var(--radius-md),12px)] px-3 text-[0.8rem] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-6 text-[0.95rem]",
        icon: "size-9",
        "icon-xs": "size-6 rounded-[min(var(--radius-md),10px)] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-[min(var(--radius-md),12px)]",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : ButtonPrimitive
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
