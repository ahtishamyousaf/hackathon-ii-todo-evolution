/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // We'll run type checking separately in CI
    ignoreBuildErrors: false,
  },
  eslint: {
    // We'll run linting separately in CI
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
