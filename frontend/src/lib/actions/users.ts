"use server"

import { db } from "@/lib/db"
import type { PartyRole } from "@/types"

export interface DbUser {
  id:            string
  walletAddress: string
  displayName:   string
  orgName:       string
  role:          string
  cantonPartyId: string
  createdAt:     string
}

function toClient(u: { id: string; walletAddress: string; displayName: string; orgName: string; role: string; cantonPartyId: string; createdAt: Date }): DbUser {
  return { ...u, createdAt: u.createdAt.toISOString() }
}

export async function getUser(walletAddress: string): Promise<DbUser | null> {
  const user = await db.user.findUnique({ where: { walletAddress: walletAddress.toLowerCase() } })
  return user ? toClient(user) : null
}

export async function createUser(data: {
  walletAddress: string
  orgName:       string
  role:          PartyRole
}): Promise<DbUser> {
  // Derive a Canton-style party ID from org name + wallet prefix
  const slug = data.orgName.trim().replace(/\s+/g, "")
  const prefix = data.walletAddress.slice(2, 10) // 8 hex chars after 0x
  const cantonPartyId = `${slug}::${prefix}`

  const user = await db.user.create({
    data: {
      walletAddress: data.walletAddress.toLowerCase(),
      displayName:   data.orgName,
      orgName:       data.orgName,
      role:          data.role,
      cantonPartyId,
    },
  })
  return toClient(user)
}

export async function deleteUser(walletAddress: string): Promise<void> {
  await db.user.deleteMany({ where: { walletAddress: walletAddress.toLowerCase() } })
}
