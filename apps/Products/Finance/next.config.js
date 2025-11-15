/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use pages directory instead of app directory
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Enable trailing slashes for better routing
  trailingSlash: false,
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
  },
  
  // Webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Handle server-side externals
    if (isServer) {
      config.externals.push('pg-native');
    }
    
    return config;
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Development server configuration
  devIndicators: {
    buildActivityPosition: 'bottom-right',
  },
  
  // Experimental features for better routing
  experimental: {
    scrollRestoration: true,
  },
};

module.exports = nextConfig;