import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { mainnet, polygon, base, sepolia } from "wagmi/chains"

export const wagmiConfig = getDefaultConfig({
  appName: "Lex Private Credit",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo",
  chains: [mainnet, polygon, base, sepolia],
  ssr: true,
})
