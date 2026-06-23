// Canton JSON API client.
// When NEXT_PUBLIC_MOCK_MODE=true, all calls are intercepted by the mock layer
// in the hooks.  Otherwise, calls hit the Canton JSON API proxy at /api/ledger.

import type { CantonContract, CantonResponse, CreateResponse } from "@/types"

const BASE = "/api/ledger"

async function ledgerFetch<T>(
  path: string,
  party: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // Party JWT would go here in production
      "Daml-Ledger-Party": party,
      ...(options?.headers ?? {}),
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Ledger API error ${res.status}: ${body}`)
  }

  return res.json() as T
}

// ── Query ─────────────────────────────────────────────────────────────────────

export async function queryContracts<T>(
  templateId: string,
  party: string,
  query: Record<string, unknown> = {}
): Promise<CantonContract<T>[]> {
  const data = await ledgerFetch<CantonResponse<T>>("/v1/query", party, {
    method: "POST",
    body: JSON.stringify({ templateIds: [templateId], query }),
  })
  return data.result
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function createContract<T>(
  templateId: string,
  party: string,
  payload: T
): Promise<CantonContract<T>> {
  const data = await ledgerFetch<CreateResponse<T>>("/v1/create", party, {
    method: "POST",
    body: JSON.stringify({ templateId, payload }),
  })
  return data.result
}

// ── Exercise ──────────────────────────────────────────────────────────────────

export async function exerciseChoice<R = unknown>(
  templateId: string,
  contractId: string,
  party: string,
  choice: string,
  argument: Record<string, unknown> = {}
): Promise<R> {
  const data = await ledgerFetch<{ status: number; result: { exerciseResult: R } }>(
    "/v1/exercise",
    party,
    {
      method: "POST",
      body: JSON.stringify({ templateId, contractId, choice, argument }),
    }
  )
  return data.result.exerciseResult
}

// ── Fetch single contract ─────────────────────────────────────────────────────

export async function fetchContract<T>(
  templateId: string,
  contractId: string,
  party: string
): Promise<CantonContract<T> | null> {
  const data = await ledgerFetch<{ status: number; result: CantonContract<T> | null }>(
    `/v1/contract/lookup`,
    party,
    {
      method: "POST",
      body: JSON.stringify({ templateId, contractId }),
    }
  )
  return data.result
}
