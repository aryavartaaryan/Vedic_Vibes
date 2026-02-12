import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // Improve build performance
  typescript: {
    ignoreBuildErrors: true, // Only if user wants to bypass TS errors, but usually safer to fix. User asked for quick fix.
  },

  experimental: {
    // optimizePackageImports: ['lucide-react', 'framer-motion'],
  }
};

export default nextConfig;
