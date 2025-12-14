import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,

  // Environment variables
  env: {
    APP_NAME: 'SGM Summit Demo',
    APP_TIER: 'summit',
  },
}

export default nextConfig
