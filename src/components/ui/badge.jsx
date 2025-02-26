import * as React from "react"
import { cn } from "../../lib/utils"

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2",
        {
          "border-transparent bg-stone-900 text-white hover:bg-stone-800": variant === "default",
          "border-transparent bg-stone-100 text-stone-900 hover:bg-stone-200": variant === "secondary",
          "border-stone-200 bg-white text-stone-900 hover:bg-stone-100": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }