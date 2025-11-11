// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Add a simple, empty function to resolve the conflict
  webpack: (config, options) => {
    return config;
  },
  // You can also delete the 'experimental' block if it was still there
};

export default nextConfig;