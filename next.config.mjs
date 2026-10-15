/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  experimental: {
    webpackBuildWorker: false,
  },
  async redirects() {
    return [
      {
        source: '/technician',
        destination: '/',
        permanent: false,
      },
      {
        source: '/scan',
        destination: '/',
        permanent: false,
      },
      {
        source: '/scan/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/assets/print-qr',
        destination: '/assets',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
