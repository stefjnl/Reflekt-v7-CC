import type { Config } from "tailwindcss";
import baseConfig from "@reflekt/ui/tailwind.config";

export default {
  ...baseConfig,
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  plugins: [
    require("@tailwindcss/typography"),
  ],
} satisfies Config;
