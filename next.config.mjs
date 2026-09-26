/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  experimental: {
    webpackBuildWorker: false,
  },
};

export default nextConfig;


