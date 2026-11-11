/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '**.vigilamc.com',
      },
    ],
  },
  experimental: {
    webpackBuildWorker: false,
  },
  async redirects() {
    return [
      {
        source: '/scan',
        destination: '/technician',
        permanent: false,
      },
      {
        source: '/scan/:path*',
        destination: '/technician',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), geolocation=(self), microphone=(self)',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
