"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useParty } from "@/context/PartyContext"
import { useCreateProposal } from "@/hooks/useProposals"
import { cn } from "@/lib/utils"

const schema = z.object({
  proposalRef:          z.string().min(3, "Reference required"),
  purpose:              z.string().min(10, "Describe the use of proceeds"),
  principal:            z.coerce.number().min(100_000, "Minimum GBP 100,000"),
  currency:             z.enum(["GBP", "USD", "EUR", "CHF", "SGD"]),
  interestRateBps:      z.coerce.number().min(0).max(5000),
  termMonths:           z.coerce.number().int().min(1).max(120),
  repaymentType:        z.enum(["Bullet", "Monthly", "Quarterly"]),
  collateralDescription:z.string().min(10, "Describe the collateral"),
  collateralValue:      z.coerce.number().min(1, "Collateral value required"),
  expiresAt:            z.string().min(1, "Expiry date required"),
})

type FormValues = z.infer<typeof schema>

export default function NewProposalPage() {
  const router = useRouter()
  const { activeParty } = useParty()
  const { createProposal, loading } = useCreateProposal()
  const [covenants, setCovenants] = useState<string[]>([""])

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: "GBP",
      repaymentType: "Quarterly",
      interestRateBps: 450,
      termMonths: 36,
    },
  })

  if (activeParty.role !== "borrower") {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-24 text-center">
        <p className="text-ink-muted">Only borrowers can create proposals.</p>
        <Link href="/proposals" className="mt-3 text-sm text-primary hover:underline block">
          Back to marketplace
        </Link>
      </div>
    )
  }

  async function onSubmit(values: FormValues) {
    try {
      await createProposal({
        terms: {
          principal: values.principal,
          currency: values.currency,
          interestRateBps: values.interestRateBps,
          termMonths: values.termMonths,
          repaymentType: values.repaymentType,
          covenants: covenants.filter(Boolean),
        },
        collateralDescription: values.collateralDescription,
        collateralValue: values.collateralValue,
        purpose: values.purpose,
        expiresAt: values.expiresAt,
      })
      toast.success("Proposal created on Canton ledger")
      router.push("/proposals")
    } catch (e) {
      toast.error("Failed to create proposal")
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/proposals" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to marketplace
      </Link>

      <h1 className="section-heading text-ink mb-2">New loan proposal</h1>
      <p className="text-ink-muted text-sm mb-10">
        Creating as <strong className="text-ink">{activeParty.displayName}</strong>.
        Your proposal will be visible only to lenders you explicitly invite.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* Deal identity */}
        <FormSection title="Deal identity">
          <Field label="Proposal reference" error={errors.proposalRef?.message}>
            <Input {...register("proposalRef")} placeholder="LEX-2026-005" />
          </Field>
          <Field label="Purpose / use of proceeds" error={errors.purpose?.message}>
            <textarea
              {...register("purpose")}
              rows={3}
              placeholder="Growth capex: new manufacturing facility…"
              className={cn(
                "w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-md text-sm text-ink",
                "placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              )}
            />
          </Field>
        </FormSection>

        {/* Loan terms */}
        <FormSection title="Loan terms">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Principal" error={errors.principal?.message}>
              <Input {...register("principal")} type="number" placeholder="5000000" prefix="£" />
            </Field>
            <Field label="Currency">
              <Select onValueChange={v => setValue("currency", v as any)} defaultValue="GBP">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["GBP","USD","EUR","CHF","SGD"].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Indicative rate (bps)" error={errors.interestRateBps?.message}>
              <Input {...register("interestRateBps")} type="number" placeholder="450" suffix="bps" />
            </Field>
            <Field label="Term (months)" error={errors.termMonths?.message}>
              <Input {...register("termMonths")} type="number" placeholder="36" />
            </Field>
            <Field label="Repayment structure">
              <Select onValueChange={v => setValue("repaymentType", v as any)} defaultValue="Quarterly">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bullet">Bullet</SelectItem>
                  <SelectItem value="Monthly">Monthly amortising</SelectItem>
                  <SelectItem value="Quarterly">Quarterly amortising</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Expiry date" error={errors.expiresAt?.message}>
              <Input {...register("expiresAt")} type="date" />
            </Field>
          </div>
        </FormSection>

        {/* Collateral */}
        <FormSection title="Collateral">
          <Field label="Description" error={errors.collateralDescription?.message}>
            <Input {...register("collateralDescription")} placeholder="First-ranking charge over…" />
          </Field>
          <Field label="Indicative value" error={errors.collateralValue?.message}>
            <Input {...register("collateralValue")} type="number" placeholder="8500000" prefix="£" />
          </Field>
        </FormSection>

        {/* Covenants */}
        <FormSection title="Financial covenants">
          <div className="space-y-2">
            {covenants.map((c, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={c}
                  onChange={e => {
                    const next = [...covenants]; next[i] = e.target.value
                    setCovenants(next)
                  }}
                  placeholder={`Covenant ${i + 1}…`}
                />
                {covenants.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setCovenants(covenants.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="w-4 h-4 text-danger" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCovenants([...covenants, ""])}
            >
              <Plus className="w-3.5 h-3.5" /> Add covenant
            </Button>
          </div>
        </FormSection>

        <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-3">
          <Link href="/proposals">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" loading={loading}>
            Create proposal on Canton
          </Button>
        </div>
      </form>
    </div>
  )
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-4 pb-2 border-b border-[var(--border)]">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  )
}
