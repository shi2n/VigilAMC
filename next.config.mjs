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
      {
        source: '/admin',
        destination: '/owner',
        permanent: false,
      },
      {
        source: '/owner-admin',
        destination: '/owner',
        permanent: false,
      },
      {
        source: '/owner/admin',
        destination: '/owner',
        permanent: false,
      },
      {
        source: '/owner-panel',
        destination: '/owner',
        permanent: false,
      },
      {
        source: '/owner/login',
        destination: '/owner',
        permanent: false,
      },
      {
        source: '/owner-console',
        destination: '/owner',
        permanent: false,
      },
      {
        source: '/ownerconsole',
        destination: '/owner',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
