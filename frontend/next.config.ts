import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'readdy.ai',
      's3-tp22.s3.ap-southeast-2.amazonaws.com'
    ],
  }
};

export default nextConfig;
