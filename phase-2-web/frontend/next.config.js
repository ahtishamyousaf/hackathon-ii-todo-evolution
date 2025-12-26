/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },

  // Rewrites for API proxy (optional - for development)
  // Note: Excludes /api/auth/* which is handled by Better Auth Next.js routes
  async rewrites() {
    return [
      {
        // Proxy task and user API requests to FastAPI backend
        // But exclude /api/auth/* which is handled by Better Auth
        source: '/api/:path((?!auth).*)*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/:path*`,
      },
    ];
  },

  // Image optimization configuration
  images: {
    domains: [],
    // Add any external image domains here if needed
  },

  // TypeScript configuration
  typescript: {
    // Enable type checking during build
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Fail build on ESLint errors
    ignoreDuringBuilds: false,
  },

  // Experimental features
  experimental: {
    // Enable any experimental features here
  },
};

module.exports = nextConfig;
