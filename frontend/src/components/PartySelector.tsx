"use client"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { ChevronDown, Check, Shield, Building2, Landmark } from "lucide-react"
import { useParty } from "@/context/PartyContext"
import { cn } from "@/lib/utils"
import type { DemoParty } from "@/types"

const ROLE_ICON = {
  borrower: Building2,
  lender:   Landmark,
  operator: Shield,
}

const ROLE_COLOR = {
  borrower: "text-primary",
  lender:   "text-accent",
  operator: "text-ink-muted",
}

function PartyAvatar({ party, size = "sm" }: { party: DemoParty; size?: "sm" | "md" }) {
  return (
    <span className={cn(
      "inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0",
      party.color,
      size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm"
    )}>
      {party.avatar}
    </span>
  )
}

export function PartySelector() {
  const { activeParty, setActiveParty, parties } = useParty()

  const roles = [
    { key: "borrower" as const, label: "Borrowers" },
    { key: "lender"   as const, label: "Lenders"   },
    { key: "operator" as const, label: "Operator"  },
  ]

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className={cn(
          "flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-[var(--border)]",
          "bg-[var(--surface)] text-sm text-ink transition-colors hover:bg-muted",
          "focus:outline-none focus:ring-2 focus:ring-primary"
        )}>
          <PartyAvatar party={activeParty} />
          <div className="hidden sm:flex flex-col items-start leading-none">
            <span className="font-medium text-xs">{activeParty.shortName}</span>
            <span className={cn("text-2xs capitalize", ROLE_COLOR[activeParty.role])}>
              {activeParty.role}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className={cn(
            "z-50 min-w-[220px] rounded-xl border border-[var(--border)]",
            "bg-[var(--surface)] shadow-float p-1",
            "animate-slide-down"
          )}
        >
          <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
            <p className="text-xs text-ink-muted font-medium tracking-wider uppercase">
              Switch party
            </p>
            <p className="text-2xs text-ink-faint mt-0.5">
              Simulates Canton ledger views
            </p>
          </div>

          {roles.map(({ key, label }) => {
            const roleParties = parties.filter(p => p.role === key)
            if (!roleParties.length) return null
            const Icon = ROLE_ICON[key]

            return (
              <div key={key}>
                <DropdownMenu.Label className="px-3 py-1.5 text-2xs font-semibold text-ink-faint uppercase tracking-wider flex items-center gap-1.5">
                  <Icon className="w-3 h-3" />
                  {label}
                </DropdownMenu.Label>
                {roleParties.map(party => (
                  <DropdownMenu.Item
                    key={party.id}
                    onSelect={() => setActiveParty(party)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm cursor-pointer",
                      "outline-none transition-colors",
                      "hover:bg-muted focus:bg-muted",
                      activeParty.id === party.id && "bg-muted"
                    )}
                  >
                    <PartyAvatar party={party} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink text-xs truncate">{party.shortName}</p>
                      <p className="text-2xs text-ink-muted truncate">{party.displayName}</p>
                    </div>
                    {activeParty.id === party.id && (
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    )}
                  </DropdownMenu.Item>
                ))}
              </div>
            )
          })}

          <div className="mt-1 px-3 py-2 border-t border-[var(--border)]">
            <p className="text-2xs text-ink-faint">
              Privacy is enforced by Canton — not the UI
            </p>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
