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
        source: '/pricing',
        destination: '/contact',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
