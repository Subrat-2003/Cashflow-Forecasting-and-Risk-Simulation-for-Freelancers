/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This allows your frontend to talk to your backend without CORS issues
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
