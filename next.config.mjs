/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
    outputFileTracingExcludes: {
      '*': ['./public/uploads/**/*'],
    },
  },
};

export default nextConfig;
