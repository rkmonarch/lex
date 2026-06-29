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

const ROLE_COLOR: Record<string, string> = {
  borrower: "text-primary",
  lender:   "text-accent",
  operator: "text-ink-muted",
}

function Avatar({ party, size = "sm" }: { party: DemoParty; size?: "sm" | "md" }) {
  return (
    <span className={cn(
      "inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0",
      size === "sm" ? "w-6 h-6 text-2xs" : "w-7 h-7 text-xs",
      party.color
    )}>
      {party.avatar}
    </span>
  )
}

export function PartySelector() {
  const { activeParty, setActiveParty, parties } = useParty()

  const groups = [
    { key: "borrower" as const, label: "Borrowers" },
    { key: "lender"   as const, label: "Lenders"   },
    { key: "operator" as const, label: "Operator"  },
  ]

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className={cn(
          "h-9 flex items-center gap-2 px-2.5 rounded-md text-sm",
          "border border-[var(--border)] bg-[var(--surface)]",
          "hover:bg-muted transition-colors focus:outline-none",
          "group"
        )}>
          <Avatar party={activeParty} />
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-xs font-medium text-ink whitespace-nowrap">{activeParty.shortName}</span>
            <span className="text-ink-faint text-xs">·</span>
            <span className={cn("text-xs capitalize", ROLE_COLOR[activeParty.role])}>
              {activeParty.role}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-ink-muted group-data-[state=open]:rotate-180 transition-transform" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className={cn(
            "z-50 w-56 rounded-lg border border-[var(--border)]",
            "bg-[var(--surface)] shadow-float p-1",
            "animate-slide-down"
          )}
        >
          {groups.map(({ key, label }, gi) => {
            const group = parties.filter(p => p.role === key)
            if (!group.length) return null
            const Icon = ROLE_ICON[key]

            return (
              <div key={key}>
                {gi > 0 && <DropdownMenu.Separator className="my-1 border-t border-[var(--border)]" />}

                <DropdownMenu.Label className="flex items-center gap-1.5 px-2 py-1 text-2xs font-medium text-ink-faint uppercase tracking-wider">
                  <Icon className="w-3 h-3" />
                  {label}
                </DropdownMenu.Label>

                {group.map(party => (
                  <DropdownMenu.Item
                    key={party.id}
                    onSelect={() => setActiveParty(party)}
                    className={cn(
                      "flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer",
                      "outline-none transition-colors select-none text-sm",
                      "hover:bg-muted focus:bg-muted",
                      activeParty.id === party.id && "bg-muted"
                    )}
                  >
                    <Avatar party={party} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink truncate">{party.shortName}</p>
                      <p className="text-2xs text-ink-muted truncate">{party.displayName}</p>
                    </div>
                    {activeParty.id === party.id && (
                      <Check className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                    )}
                  </DropdownMenu.Item>
                ))}
              </div>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
