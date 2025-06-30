/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore test files and other problematic imports during server-side build
      config.externals = config.externals || [];
      config.externals.push({
        'fs': 'commonjs fs',
        'path': 'commonjs path'
      });
    }
    
    // Ignore specific files that cause build issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    
    return config;
  },
};

module.exports = nextConfig;