"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./ThemeToggle"
import { PartySelector } from "@/components/PartySelector"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/dashboard",     label: "Dashboard"   },
  { href: "/proposals",     label: "Marketplace" },
  { href: "/loans",         label: "Loans"       },
  { href: "/privacy-demo",  label: "Privacy Demo" },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-14 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto h-full px-6 flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {/* Corner-bracket logo mark — Polymarket-inspired */}
          <span className="relative w-6 h-6 flex items-center justify-center">
            <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-ink rounded-tl-[2px]" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-ink rounded-br-[2px]" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          </span>
          <span className="font-semibold text-ink tracking-tight">
            Lex <span className="font-light text-ink-muted">Private Credit</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm transition-colors",
                pathname.startsWith(link.href)
                  ? "text-ink font-medium bg-muted"
                  : "text-ink-muted hover:text-ink hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <PartySelector />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
