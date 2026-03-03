import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-[#121212]/40 selection:bg-[#1040C0] selection:text-white border-2 border-[#121212] h-9 w-full min-w-0 bg-white px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-[#1040C0] focus-visible:ring-[#1040C0]/30 focus-visible:ring-[3px]",
        "aria-invalid:ring-[#D02020]/20 aria-invalid:border-[#D02020]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
