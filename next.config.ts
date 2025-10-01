import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/hostinger-horizons-assets-prod/**',
      },
      {
        protocol: 'https',
        hostname: 'otwvfihzaznyjvjtkvvd.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'concepto.de',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
