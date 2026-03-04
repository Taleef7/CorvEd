import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold uppercase tracking-wider transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 border-2 border-[#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  {
    variants: {
      variant: {
        default: "bg-[#D02020] text-white shadow-[4px_4px_0_0_#121212] hover:bg-[#B01818]",
        destructive:
          "bg-[#D02020] text-white shadow-[4px_4px_0_0_#121212] hover:bg-[#B01818]",
        outline:
          "bg-white text-[#121212] shadow-[4px_4px_0_0_#121212] hover:bg-[#F0F0F0]",
        secondary:
          "bg-[#1040C0] text-white shadow-[4px_4px_0_0_#121212] hover:bg-[#0830A0]",
        ghost:
          "border-transparent shadow-none hover:bg-[#E0E0E0] hover:border-[#121212]",
        link: "border-transparent shadow-none text-[#1040C0] underline-offset-4 hover:underline",
        yellow:
          "bg-[#F0C020] text-[#121212] shadow-[4px_4px_0_0_#121212] hover:bg-[#D8AC18]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
