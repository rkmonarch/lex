"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Building2, Landmark, ArrowRight, Check, Loader2 } from "lucide-react"
import { createUser } from "@/lib/actions/users"
import { cn } from "@/lib/utils"
import type { PartyRole } from "@/types"

type Step = "connect" | "role" | "org" | "done"

const ROLES: { key: PartyRole; label: string; desc: string; Icon: typeof Building2 }[] = [
  {
    key:   "borrower",
    label: "Borrower",
    desc:  "Submit loan proposals and receive competitive financing from institutional lenders",
    Icon:  Building2,
  },
  {
    key:   "lender",
    label: "Lender",
    desc:  "Browse confidential loan proposals and submit offers to creditworthy borrowers",
    Icon:  Landmark,
  },
]

export default function OnboardingPage() {
  const router  = useRouter()
  const { address, isConnected } = useAccount()

  const [step,    setStep]    = useState<Step>(isConnected ? "role" : "connect")
  const [role,    setRole]    = useState<PartyRole | null>(null)
  const [orgName, setOrgName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")

  // If wallet becomes connected while on connect step, advance
  if (isConnected && step === "connect") setStep("role")

  async function handleCreate() {
    if (!address || !role || !orgName.trim()) return
    setLoading(true)
    setError("")
    try {
      await createUser({ walletAddress: address, orgName: orgName.trim(), role })
      setStep("done")
      setTimeout(() => router.push("/dashboard"), 1800)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg)]">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <span className="relative w-7 h-7 flex items-center justify-center shrink-0">
            <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-ink rounded-tl-[2px]" />
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-ink rounded-br-[2px]" />
            <span className="w-2 h-2 rounded-full bg-primary" />
          </span>
          <span className="font-semibold text-ink text-lg tracking-tight">
            Lex <span className="font-light text-ink-muted">Private Credit</span>
          </span>
        </div>

        {/* Step: connect wallet */}
        {step === "connect" && (
          <div className="card p-8 text-center space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-ink mb-2">Connect your wallet</h1>
              <p className="text-sm text-ink-muted">
                Your wallet address becomes your Canton party identity on the ledger.
              </p>
            </div>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        )}

        {/* Step: pick role */}
        {step === "role" && (
          <div className="card p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-ink mb-2">What is your role?</h1>
              <p className="text-sm text-ink-muted">
                This determines your visibility on the Canton Network.
              </p>
            </div>

            <div className="space-y-3">
              {ROLES.map(({ key, label, desc, Icon }) => (
                <button
                  key={key}
                  onClick={() => setRole(key)}
                  className={cn(
                    "w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all",
                    role === key
                      ? "border-primary bg-primary/5"
                      : "border-[var(--border)] hover:border-ink-muted bg-[var(--surface)]"
                  )}
                >
                  <span className={cn(
                    "mt-0.5 flex items-center justify-center w-9 h-9 rounded-lg shrink-0",
                    role === key ? "bg-primary text-white" : "bg-muted text-ink-muted"
                  )}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink text-sm">{label}</p>
                    <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                  {role === key && (
                    <Check className="w-4 h-4 text-primary mt-1 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <button
              disabled={!role}
              onClick={() => setStep("org")}
              className={cn(
                "btn-black w-full justify-center",
                !role && "opacity-40 cursor-not-allowed"
              )}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step: org name */}
        {step === "org" && (
          <div className="card p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-ink mb-2">Your organisation</h1>
              <p className="text-sm text-ink-muted">
                This becomes your display name on the marketplace and is embedded in your Canton party ID.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">
                Organisation name
              </label>
              <input
                type="text"
                placeholder="e.g. Meridian Capital"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !loading && orgName.trim() && handleCreate()}
                className={cn(
                  "w-full px-4 py-3 rounded-lg border border-[var(--border)]",
                  "bg-[var(--surface)] text-ink text-sm",
                  "placeholder:text-ink-faint",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                )}
              />
              {address && orgName.trim() && (
                <p className="text-2xs text-ink-faint font-mono mt-1">
                  Party ID: {orgName.trim().replace(/\s+/g,"")}::{address.slice(2,10)}
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-error bg-error/10 rounded-lg px-4 py-3">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep("role")}
                className="btn-outline flex-1 justify-center"
              >
                Back
              </button>
              <button
                disabled={!orgName.trim() || loading}
                onClick={handleCreate}
                className={cn(
                  "btn-black flex-1 justify-center",
                  (!orgName.trim() || loading) && "opacity-40 cursor-not-allowed"
                )}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</>
                ) : (
                  <>Register <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step: done */}
        {step === "done" && (
          <div className="card p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 text-success" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-ink">Welcome to Lex</h2>
              <p className="text-sm text-ink-muted mt-1">Your Canton identity has been created. Redirecting to dashboard...</p>
            </div>
          </div>
        )}

        {/* Step indicator dots */}
        {step !== "connect" && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {(["role", "org", "done"] as Step[]).map((s) => (
              <span
                key={s}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  s === step ? "bg-primary w-4" : "bg-[var(--border)]"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
