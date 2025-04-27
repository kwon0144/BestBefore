import type { NextConfig } from "next";

const getBasePath = () => {
  const branch = process.env.NEXT_PUBLIC_BRANCH_NAME || 'main';
  if (branch === 'main') {
    return '';
  }
  return `/${branch}`;
};

const nextConfig: NextConfig = {
  /* config options here */
  basePath: getBasePath(),
};

export default nextConfig;
