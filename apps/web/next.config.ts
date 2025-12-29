import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  transpilePackages: ["@reflekt/db", "@reflekt/ui"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default config;
