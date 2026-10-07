/** @type {import('next').NextConfig} */
const isCapacitor = process.env.CAPACITOR === 'true';

const nextConfig = {
  ...(isCapacitor ? { 
    output: 'export',
    trailingSlash: true,
  } : {}),
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
