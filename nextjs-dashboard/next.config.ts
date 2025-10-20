import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
//    cacheComponents: true // supposed to help partial prerendering performance, but has issues. do not use.
  }
};

export default nextConfig;
