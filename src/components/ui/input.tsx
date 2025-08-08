import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 transition-all duration-150",
        "focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none",
        "hover:border-gray-300",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
