/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'otwvfihzaznyjvjtkvvd.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ahorasaladillo-diariodigital.com.ar',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-5b294f92f42e4cbda687d0122e15bc72.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'saladillovivo.vercel.app',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;