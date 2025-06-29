// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Disable ESLint errors during build
  },
  // ❌ Remove this line if you're not customizing serverActions object
  // experimental: {
  //   serverActions: { bodySizeLimit: '1mb' }, // optional if you use them
  // },
};

export default nextConfig;
