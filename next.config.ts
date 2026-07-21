import type { NextConfig } from "next";

// Fallback to local if the env variable isn't set yet
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  // reactStrictMode: false,
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allows images from ANY external https domain
      },
      { protocol: "https", hostname: "images.unsplash.com" },
      {
        protocol: "https",
        hostname: "cdn.britannica.com",
      },
      {
        protocol: "https",
        hostname: "www.humana.org",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/**",
      },
      // Add your Azure production hostname here too so Next/Image can optimize its assets:
      // { protocol: "https", hostname: "your-azure-app.azurewebsites.net", pathname: "/**" }
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },

  async rewrites() {
    return [
      {
        source: "/api-backend/:path*",
        // Now dynamically toggles between Localhost and Azure depending on your environment
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
