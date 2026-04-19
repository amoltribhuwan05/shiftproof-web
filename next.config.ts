import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingExcludes: {
    "*": [
      "middleware.js.nft.json",
      "middleware.js",
      ".next/server/middleware.js.nft.json"
    ],
  },
};

export default nextConfig;
