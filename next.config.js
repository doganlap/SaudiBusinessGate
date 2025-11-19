/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations for Saudi Store
  output: 'standalone',
  outputFileTracingRoot: process.cwd(),
  poweredByHeader: false,

  // Use webpack to resolve module conflicts

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },

  // Enable experimental features for AI integration
  experimental: {
    optimizePackageImports: ['framer-motion', '@radix-ui/react-icons'],
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // Add empty turbopack config to silence the warning
  turbopack: {},

  // Webpack configuration for Lingui and module resolution
  webpack: (config, { isServer }) => {
    // Add PO file loader for Lingui
    config.module.rules.push({
      test: /\.po$/,
      use: {
        loader: '@lingui/loader',
      },
    });
    
    // Fix ESM/CommonJS module conflicts
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Handle module system conflicts
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });
    
    return config;
  },
  
  // Image optimization - use remotePatterns instead of domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'doganhub.com',
      },
      {
        protocol: 'https',
        hostname: 'dogan-ai.com',
      },
      {
        protocol: 'https',
        hostname: 'doganconsult.com',
      },
      {
        protocol: 'https',
        hostname: 'shahin-ai.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  
  // API rewrites for microservices
  async rewrites() {
    return [
      {
        source: '/api/billing/:path*',
        destination: process.env.BILLING_SERVICE_URL ? 
          `${process.env.BILLING_SERVICE_URL}/api/billing/:path*` :
          'http://localhost:5050/api/billing/:path*',
      },
      {
        source: '/api/auth/:path*',
        destination: process.env.AUTH_SERVICE_URL ?
          `${process.env.AUTH_SERVICE_URL}/api/auth/:path*` :
          '/api/auth/:path*',
      },
      // Exclude finance API from proxy to use Next.js API routes directly
      {
        source: '/api/finance/:path*',
        destination: '/api/finance/:path*',
      },
      {
        source: '/api/:path*',
        destination: process.env.BACKEND_URL
          ? `${process.env.BACKEND_URL}/api/:path*`
          : 'http://localhost:3008/api/:path*',
      },
    ];
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
    // Remove console.log in production but keep error and warn
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
};

export default nextConfig;
