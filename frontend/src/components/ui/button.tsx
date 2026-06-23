import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        default:   "bg-[var(--black)] text-[var(--bg)] hover:opacity-80",
        primary:   "bg-primary text-white hover:bg-primary-hover",
        outline:   "border border-[var(--border-strong)] bg-transparent text-ink hover:bg-muted",
        ghost:     "bg-transparent text-ink hover:bg-muted",
        danger:    "bg-danger text-white hover:opacity-90",
        success:   "bg-success text-white hover:opacity-90",
        link:      "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm:   "h-8 px-3 text-xs rounded",
        md:   "h-9 px-4",
        lg:   "h-11 px-6 text-base",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
