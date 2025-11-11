import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The only reason we need this config is to force Webpack
  // to avoid the Turbopack crash.
  webpack: (config, options) => {
    return config;
  },
};

export default nextConfig;