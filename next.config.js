/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the export output for development
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;