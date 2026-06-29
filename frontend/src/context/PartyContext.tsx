"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAccount } from "wagmi"
import { DEMO_PARTIES } from "@/lib/mock-data"
import { getUser } from "@/lib/actions/users"
import type { DemoParty, PartyRole } from "@/types"
import type { DbUser } from "@/lib/actions/users"

// Palette for wallet-derived party avatars
const WALLET_COLORS = [
  "bg-blue-600", "bg-violet-600", "bg-rose-600",
  "bg-teal-600", "bg-orange-600", "bg-cyan-600",
]

function addrToColor(addr: string) {
  const n = parseInt(addr.slice(2, 4), 16)
  return WALLET_COLORS[n % WALLET_COLORS.length]
}

function userToParty(u: DbUser): DemoParty {
  const words = u.orgName.trim().split(/\s+/)
  const avatar = words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : u.orgName.slice(0, 2).toUpperCase()

  return {
    id:          u.cantonPartyId,
    displayName: u.orgName,
    shortName:   words[0],
    role:        u.role as PartyRole,
    avatar,
    color:       addrToColor(u.walletAddress),
  }
}

interface PartyContextValue {
  activeParty:      DemoParty
  setActiveParty:   (party: DemoParty) => void
  parties:          DemoParty[]
  walletUser:       DbUser | null
  walletLoading:    boolean
  isWalletMode:     boolean  // true when identity comes from connected wallet
}

const PartyContext = createContext<PartyContextValue | null>(null)

export function PartyProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()

  const [demoParty, setDemoParty] = useState<DemoParty>(
    DEMO_PARTIES.find(p => p.role === "borrower")!
  )
  const [walletUser, setWalletUser]   = useState<DbUser | null>(null)
  const [walletLoading, setWalletLoading] = useState(false)

  useEffect(() => {
    if (!isConnected || !address) {
      setWalletUser(null)
      return
    }
    setWalletLoading(true)
    getUser(address)
      .then(setWalletUser)
      .catch(() => setWalletUser(null))
      .finally(() => setWalletLoading(false))
  }, [isConnected, address])

  const walletParty    = walletUser ? userToParty(walletUser) : null
  const isWalletMode   = !!walletParty
  const activeParty    = walletParty ?? demoParty
  const setActiveParty = (p: DemoParty) => { if (!isWalletMode) setDemoParty(p) }

  return (
    <PartyContext.Provider value={{
      activeParty,
      setActiveParty,
      parties: DEMO_PARTIES,
      walletUser,
      walletLoading,
      isWalletMode,
    }}>
      {children}
    </PartyContext.Provider>
  )
}

export function useParty(): PartyContextValue {
  const ctx = useContext(PartyContext)
  if (!ctx) throw new Error("useParty must be used inside <PartyProvider>")
  return ctx
}
