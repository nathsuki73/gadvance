import type { NextConfig } from "next";

// Fallback to local if the env variable isn't set yet
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const isDevelopment = process.env.NODE_ENV === "development";

// Sent with every response. A Content-Security-Policy is not set here: the
// lesson editor, Google sign-in, and remote images need a tested policy first.
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Stops other sites from framing GADvance pages (clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Browsers ignore this over plain http, so local development is unaffected.
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // reactStrictMode: false,
  poweredByHeader: false,
  images: {
    // Lets the image optimizer fetch from private addresses. Needed for the
    // local API, but in production it would let anyone use /_next/image to
    // reach services on the server's internal network.
    dangerouslyAllowLocalIP: isDevelopment,
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
      ...(isDevelopment
        ? [
            {
              protocol: "http" as const,
              hostname: "127.0.0.1",
              port: "8000",
              pathname: "/**",
            },
          ]
        : []),
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
          ...SECURITY_HEADERS,
        ],
      },
    ];
  },
};

export default nextConfig;
