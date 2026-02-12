import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Force rebuild to ensure dark theme CSS is applied
  env: {
    BUILD_TIME: new Date().toISOString(),
  },
};

export default nextConfig;
