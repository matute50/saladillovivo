/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'otwvfihzaznyjvjtkvvd.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'ahorasaladillo-diariodigital.com.ar',
      },
      {
        protocol: 'https',
        hostname: 'pub-5b294f92f42e4cbda687d0122e15bc72.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'saladillovivo.vercel.app',
      },
    ],

  },
};

module.exports = nextConfig;