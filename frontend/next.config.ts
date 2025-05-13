import type { NextConfig } from "next";

const getBasePath = () => {
  const branch = process.env.NEXT_PUBLIC_BRANCH_NAME || 'develop';
  if (branch === 'main') {
    return '';
  }
  return `/${branch}`;
};

const nextConfig: NextConfig = {
  /* config options here */
  basePath: getBasePath(),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3-tp22.s3.ap-southeast-2.amazonaws.com',
      }
    ],
  },
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
