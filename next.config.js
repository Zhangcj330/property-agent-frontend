/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'view.com.au',
        pathname: '/viewstatic/images/**',
      },
    ],
  },
};

module.exports = nextConfig; 