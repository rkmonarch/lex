"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { DEMO_PARTIES } from "@/lib/mock-data"
import type { DemoParty } from "@/types"

interface PartyContextValue {
  activeParty: DemoParty
  setActiveParty: (party: DemoParty) => void
  parties: DemoParty[]
}

const PartyContext = createContext<PartyContextValue | null>(null)

export function PartyProvider({ children }: { children: ReactNode }) {
  // Default to the borrower so first-time visitors see a meaningful view
  const [activeParty, setActiveParty] = useState<DemoParty>(
    DEMO_PARTIES.find(p => p.role === "borrower")!
  )

  return (
    <PartyContext.Provider value={{ activeParty, setActiveParty, parties: DEMO_PARTIES }}>
      {children}
    </PartyContext.Provider>
  )
}

export function useParty(): PartyContextValue {
  const ctx = useContext(PartyContext)
  if (!ctx) throw new Error("useParty must be used inside <PartyProvider>")
  return ctx
}
