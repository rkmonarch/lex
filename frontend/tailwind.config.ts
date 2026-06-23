import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Map to CSS variables so light/dark switch automatically
        bg:       "var(--bg)",
        surface:  "var(--surface)",
        border:   "var(--border)",
        "border-strong": "var(--border-strong)",
        muted:    "var(--bg-secondary)",
        primary: {
          DEFAULT: "var(--primary)",
          hover:   "var(--primary-hover)",
          subtle:  "var(--primary-subtle)",
        },
        accent:   "var(--accent)",
        success: {
          DEFAULT: "var(--success)",
          subtle:  "var(--success-subtle)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          subtle:  "var(--warning-subtle)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          subtle:  "var(--danger-subtle)",
        },
        ink: {
          DEFAULT: "var(--text)",
          muted:   "var(--text-muted)",
          faint:   "var(--text-faint)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
      letterSpacing: {
        tighter: "-0.03em",
        tight:   "-0.02em",
      },
      animation: {
        "fade-up":    "fadeUp 0.25s ease-out",
        "fade-in":    "fadeIn 0.2s ease-out",
        "slide-down": "slideDown 0.2s ease-out",
        "float-1":    "float1 6s ease-in-out infinite",
        "float-2":    "float2 8s ease-in-out infinite",
        "float-3":    "float3 7s ease-in-out infinite",
      },
      keyframes: {
        fadeUp:    { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeIn:    { from: { opacity: "0" }, to: { opacity: "1" } },
        slideDown: { from: { opacity: "0", transform: "translateY(-6px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        float1:    { "0%,100%": { transform: "translateY(0px)" },  "50%": { transform: "translateY(-12px)" } },
        float2:    { "0%,100%": { transform: "translateY(-8px)" }, "50%": { transform: "translateY(8px)" }  },
        float3:    { "0%,100%": { transform: "translateY(4px)" },  "50%": { transform: "translateY(-16px)" } },
      },
      boxShadow: {
        card:   "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)",
        modal:  "0 24px 64px rgba(0,0,0,0.15)",
        float:  "0 8px 32px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
}

export default config
