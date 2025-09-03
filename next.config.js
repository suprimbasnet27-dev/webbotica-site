/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // You can keep this if you want
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'writer.webbotica.com',
          },
        ],
        destination: 'https://webbotica.com/writer/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
