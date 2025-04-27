import type { NextConfig } from "next";

const getBasePath = () => {
  const branch = process.env.NEXT_PUBLIC_BRANCH_NAME || 'main';
  console.log('branch', branch);
  if (branch === 'main') {
    return '';
  }
  return `/${branch}`;
};

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'readdy.ai',
      's3-tp22.s3.ap-southeast-2.amazonaws.com'
    ],
  },
  basePath: getBasePath(),
};

export default nextConfig;
