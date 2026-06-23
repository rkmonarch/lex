import * as React from "react"
import { cn } from "@/lib/utils"

// Use Omit to remove the conflicting native `prefix: string` attribute
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix" | "suffix"> {
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, prefix, suffix, ...props }, ref) => {
    if (prefix || suffix) {
      return (
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-sm pointer-events-none select-none" style={{ color: "var(--text-muted)" }}>
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full h-9 bg-[var(--surface)] border border-[var(--border)] rounded-md text-sm",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
              "placeholder:opacity-50",
              prefix  ? "pl-8"  : "pl-3",
              suffix  ? "pr-10" : "pr-3",
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 text-sm pointer-events-none select-none" style={{ color: "var(--text-muted)" }}>
              {suffix}
            </span>
          )}
        </div>
      )
    }

    return (
      <input
        ref={ref}
        className={cn(
          "w-full h-9 px-3 bg-[var(--surface)] border border-[var(--border)] rounded-md text-sm",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
          "placeholder:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
