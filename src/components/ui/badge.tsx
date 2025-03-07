import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9DDEE] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#27568B] text-white shadow hover:bg-[#27568B]/80",
        secondary:
          "border-transparent bg-[#C9DDEE] text-[#27568B] hover:bg-[#C9DDEE]/80",
        destructive:
          "border-transparent bg-[#B68250] text-white shadow hover:bg-[#B68250]/80",
        outline: "text-[#27568B] border-[#C9DDEE]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
