/** Meridian design system — Tailwind preset (docs/02-DESIGN-SYSTEM.md). */
import type { Config } from "tailwindcss";

export const meridianPreset: Partial<Config> = {
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)", bg2: "var(--bg2)", bg3: "var(--bg3)",
        line: "var(--line)", line2: "var(--line2)",
        t1: "var(--t1)", t2: "var(--t2)", t3: "var(--t3)",
        gold: { DEFAULT: "#C9A461", deep: "#A87F3D", soft: "#E8CFA0" },
        build: "#C08A4E", run: "#4E7EC0", grow: "#3FA372",
        success: "#2E9E6B", warning: "#D98E28", danger: "#D2493F",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: { sm: "10px", md: "16px", lg: "24px", xl: "32px" },
      boxShadow: {
        card: "0 8px 24px rgba(16,19,25,.08)",
        lift: "var(--shadow)",
      },
      transitionTimingFunction: { meridian: "cubic-bezier(.22,1,.36,1)" },
      maxWidth: { content: "1200px" },
    },
  },
};
export default meridianPreset;
