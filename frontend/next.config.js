/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['s3-tp22.s3.ap-southeast-2.amazonaws.com'],
  },
}

module.exports = nextConfig 