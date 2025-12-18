import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,

  // Transpile local @rally packages
  transpilePackages: [
    '@rally/app-shell',
    '@rally/blocks-ai',
    '@rally/ai-clients',
    '@rally/ai-contracts',
    '@rally/signal-bus',
    '@rally/telemetry',
  ],

  // Environment variables
  env: {
    APP_NAME: 'SGM Summit Demo',
    APP_TIER: 'summit',
  },
}

export default nextConfig
