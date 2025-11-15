/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  output: 'standalone',
  
  // External packages for server-side rendering
  serverExternalPackages: ['pg', 'bcryptjs', 'pg-native'],
  
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
    domains: ['localhost', 'doganhub.com', 'dogan-ai.com', 'doganconsult.com', 'shahin-ai.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  
  // Webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Handle server-side externals
    if (isServer) {
      config.externals.push('pg-native');
    }
    
    // Optimize for production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // API rewrites for microservices
  async rewrites() {
    return [
      {
        source: '/api/billing/:path*',
        destination: process.env.BILLING_SERVICE_URL ? 
          `${process.env.BILLING_SERVICE_URL}/api/billing/:path*` :
          'http://localhost:3001/api/billing/:path*',
      },
      {
        source: '/api/auth/:path*',
        destination: process.env.AUTH_SERVICE_URL ?
          `${process.env.AUTH_SERVICE_URL}/api/auth/:path*` :
          '/api/auth/:path*',
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
  
  // Experimental features (stable ones only)
  experimental: {
    // Only include stable experimental features
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
