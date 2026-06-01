import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },

  /* -------------------------------------------------------
   * PRODUCTION REWRITES (Fixes Mixed Content Errors)
   * -----------------------------------------------------*/
  async rewrites() {
    return [
      {
        // Catches browser requests targeting /api-backend/
        source: "/api-backend/:path*",
        // Pipes them securely to your AWS EC2 instance over the cloud network
        destination: "http://13.229.44.51/:path*",
      },
    ];
  },
};

export default nextConfig;
