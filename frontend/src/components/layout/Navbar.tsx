"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import { ThemeToggle } from "./ThemeToggle"
import { PartySelector } from "@/components/PartySelector"
import { useParty } from "@/context/PartyContext"
import { cn } from "@/lib/utils"
import { Loader2, UserPlus, Wallet, AlertTriangle, ChevronDown } from "lucide-react"

const NAV_LINKS = [
  { href: "/dashboard",     label: "Dashboard"   },
  { href: "/proposals",     label: "Marketplace" },
  { href: "/loans",         label: "Loans"       },
  { href: "/privacy-demo",  label: "Privacy Demo" },
]

function WalletIdentity() {
  const router = useRouter()
  const { isConnected } = useAccount()
  const { activeParty, walletUser, walletLoading, isWalletMode } = useParty()

  // Not connected — show demo party selector
  if (!isConnected) {
    return <PartySelector />
  }

  // Connected but still loading user record
  if (walletLoading) {
    return (
      <span className="h-9 flex items-center gap-2 px-3 text-sm text-ink-muted">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="hidden sm:inline">Loading...</span>
      </span>
    )
  }

  // Connected but not registered
  if (!walletUser) {
    return (
      <button
        onClick={() => router.push("/onboarding")}
        className="h-9 flex items-center gap-1.5 px-3 rounded-md border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
      >
        <UserPlus className="w-4 h-4" />
        <span className="hidden sm:inline">Set up identity</span>
      </button>
    )
  }

  // Connected + registered: show wallet identity badge
  const roleColors: Record<string, string> = {
    borrower: "text-primary",
    lender:   "text-accent",
    operator: "text-ink-muted",
  }

  return (
    <div className={cn(
      "h-9 flex items-center gap-2 px-2.5 rounded-md border border-[var(--border)]",
      "bg-[var(--surface)] text-sm"
    )}>
      <span className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white text-xs w-6 h-6 shrink-0",
        activeParty.color
      )}>
        {activeParty.avatar}
      </span>
      <div className="hidden sm:flex items-center gap-1.5">
        <span className="font-medium text-xs text-ink whitespace-nowrap">{activeParty.shortName}</span>
        <span className="text-ink-faint text-xs">·</span>
        <span className={cn("text-xs capitalize", roleColors[activeParty.role] ?? "text-ink-muted")}>
          {activeParty.role}
        </span>
      </div>
    </div>
  )
}

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-14 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto h-full px-6 flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
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

        <div className="ml-auto flex items-center gap-2">
          <WalletIdentity />
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              const ready = mounted
              const connected = ready && account && chain
              return (
                <div
                  {...(!ready && {
                    "aria-hidden": true,
                    style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
                  })}
                >
                  {!connected ? (
                    <button
                      onClick={openConnectModal}
                      className={cn(
                        "h-9 flex items-center gap-2 px-4 rounded-md text-sm font-medium transition-all",
                        "bg-ink text-bg border border-ink",
                        "hover:opacity-85 active:scale-[0.98]"
                      )}
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      Connect Wallet
                    </button>
                  ) : chain.unsupported ? (
                    <button
                      onClick={openChainModal}
                      className="h-9 flex items-center gap-1.5 px-3 rounded-md bg-danger text-white text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Wrong network
                    </button>
                  ) : (
                    <button
                      onClick={openAccountModal}
                      className={cn(
                        "h-9 flex items-center gap-2 px-2.5 rounded-md text-sm transition-colors",
                        "border border-[var(--border)] bg-[var(--surface)] hover:bg-muted"
                      )}
                    >
                      {account.ensAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={account.ensAvatar} alt="avatar" className="w-5 h-5 rounded-full" />
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-2xs font-semibold">
                          {account.displayName.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <span className="font-medium text-ink text-xs hidden sm:block">
                        {account.displayName}
                      </span>
                      <ChevronDown className="w-3 h-3 text-ink-muted" />
                    </button>
                  )}
                </div>
              )
            }}
          </ConnectButton.Custom>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
