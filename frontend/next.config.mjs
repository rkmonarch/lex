/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/ledger/:path*",
        destination: `${process.env.LEDGER_API_URL ?? "http://localhost:7575"}/:path*`,
      },
    ]
  },
}

export default config
