import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Skip TypeScript type checking during build (for demo)
  typescript: {
    ignoreBuildErrors: true,
  },

  // External packages that shouldn't be bundled
  serverExternalPackages: ['pdf-parse', '@napi-rs/canvas', 'mammoth', 'better-sqlite3'],

  // Environment variables
  env: {
    APP_NAME: 'SGM Summit Demo',
    APP_TIER: 'summit',
  },
}

export default nextConfig
