import type { Config } from "tailwindcss";
import { meridianPreset } from "@mazidi/ui/tailwind-preset";

export default {
  presets: [meridianPreset as Config],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
} satisfies Config;
