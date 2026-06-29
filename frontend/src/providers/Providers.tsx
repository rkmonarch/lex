"use client"

import "@rainbow-me/rainbowkit/styles.css"

import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider, lightTheme, darkTheme } from "@rainbow-me/rainbowkit"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { wagmiConfig } from "@/lib/wagmi"

function RainbowWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const theme = mounted && resolvedTheme === "dark"
    ? darkTheme({ accentColor: "#6366f1", borderRadius: "medium" })
    : lightTheme({ accentColor: "#2563eb", borderRadius: "medium" })

  return (
    <RainbowKitProvider theme={theme}>
      {children}
    </RainbowKitProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: { staleTime: 30_000, retry: 1 },
      },
    })
  )

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowWrapper>
          {children}
        </RainbowWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
