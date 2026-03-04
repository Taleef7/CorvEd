import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center border-2 border-[#121212] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-[#D02020] text-white border-[#121212]",
        secondary:
          "bg-[#1040C0] text-white border-[#121212]",
        destructive:
          "bg-[#D02020] text-white border-[#121212]",
        outline:
          "bg-white text-[#121212] border-[#121212]",
        ghost: "bg-[#E0E0E0] text-[#121212] border-transparent",
        link: "text-[#1040C0] underline-offset-4 border-transparent [a&]:hover:underline",
        yellow: "bg-[#F0C020] text-[#121212] border-[#121212]",
        success: "bg-[#121212] text-white border-[#121212]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
