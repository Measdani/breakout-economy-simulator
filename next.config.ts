import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Force rebuild to ensure pagination and scrolling fixes are applied
  env: {
    BUILD_TIME: new Date().toISOString(),
  },
};

export default nextConfig;
