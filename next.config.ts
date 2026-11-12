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

  // Pages removed in the public content audit: they advertised features,
  // courses, and articles that the platform does not provide.
  async redirects() {
    return [
      { source: "/community-forum", destination: "/support", permanent: false },
      { source: "/leadership", destination: "/explore", permanent: false },
      { source: "/advocacy", destination: "/explore", permanent: false },
      { source: "/articles-and-news", destination: "/about", permanent: false },
    ];
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

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Vary",
            value: "RSC, Next-Router-Prefetch, Next-Router-State-Tree",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
