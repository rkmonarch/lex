import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "primary" | "accent" | "outline"
  dot?: boolean
}

export function Badge({ className, variant = "default", dot = false, children, ...props }: BadgeProps) {
  const variants = {
    default:  "bg-[var(--bg-secondary)] text-ink-muted border border-[var(--border)]",
    success:  "bg-success/10 text-success border border-success/20",
    warning:  "bg-warning/10 text-warning border border-warning/20",
    danger:   "bg-danger/10  text-danger  border border-danger/20",
    primary:  "bg-primary/10 text-primary  border border-primary/20",
    accent:   "bg-accent/10  text-accent   border border-accent/20",
    outline:  "bg-transparent text-ink-muted border border-[var(--border-strong)]",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn(
          "w-1.5 h-1.5 rounded-full",
          variant === "success" && "bg-success",
          variant === "warning" && "bg-warning",
          variant === "danger"  && "bg-danger",
          variant === "primary" && "bg-primary",
          variant === "accent"  && "bg-accent",
          variant === "default" && "bg-ink-faint",
        )} />
      )}
      {children}
    </span>
  )
}
