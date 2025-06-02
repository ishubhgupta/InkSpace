/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    domains: ['images.pexels.com', 'veikoyokixmrjuczwbto.supabase.co'],
    unoptimized: false 
  },
  webpack: (config, { dev, isServer }) => {
    // Disable cache in development to prevent ENOENT errors
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;