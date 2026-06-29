export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { Navbar } from "@/components/layout/Navbar"
import { PartyProvider } from "@/context/PartyContext"
import { Providers } from "@/providers/Providers"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "Lex: Private Credit Marketplace",
  description: "Institutional-grade confidential private credit on Canton Network",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <Providers>
            <PartyProvider>
              <Navbar />
              <main className="pt-14 min-h-screen">
                {children}
              </main>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  },
                }}
              />
            </PartyProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
