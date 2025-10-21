import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // for deploying with Docker
  experimental: {
//    cacheComponents: true // supposed to help partial prerendering performance, but has issues. do not use.
  }
};

export default nextConfig;
