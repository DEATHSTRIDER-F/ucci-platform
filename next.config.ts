import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mbobdhoyokseptgoopow.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'api.iconify.design',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // Cache static pages for 60s, speed up repeated hits
  experimental: {
    optimizePackageImports: ['lucide-react', '@iconify/react'],
  },
}

export default nextConfig
