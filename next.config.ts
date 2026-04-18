import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent ESLint warnings from failing the Cloudflare Pages build.
  // `next-on-pages` calls `next build` internally; any ESLint error
  // would abort the CF deploy. Lint locally with `npm run lint`.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
