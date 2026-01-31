import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-cyan-600 text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-white shadow-lg shadow-destructive/30 hover:shadow-xl hover:shadow-destructive/40 hover:-translate-y-0.5",
        outline:
          "glass border-glass-border hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)] hover:-translate-y-0.5",
        secondary:
          "bg-[rgba(255,255,255,0.06)] text-foreground border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.15)] hover:-translate-y-0.5",
        ghost:
          "text-muted-foreground hover:bg-[rgba(255,255,255,0.06)] hover:text-foreground",
        link: 
          "text-primary underline-offset-4 hover:underline",
        glass:
          "bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] text-foreground hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)] hover:-translate-y-0.5 shadow-lg",
        glow:
          "bg-gradient-to-r from-primary to-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg gap-1.5 px-3.5",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg font-semibold",
        icon: "size-11 rounded-xl",
        "icon-sm": "size-9 rounded-lg",
        "icon-lg": "size-12 rounded-xl",
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
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
