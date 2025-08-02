import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PWA configuration
  serverExternalPackages: [],
  
  // Generate unique build ID for cache busting in production
  generateBuildId: async () => {
    // Use timestamp to ensure each deployment has a unique cache version
    return `build-${Date.now()}`;
  },
  // Ensure proper headers for PWA
  async headers() {
    return [
      {
        source: "/site.webmanifest",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  // Security headers for PWA
  async rewrites() {
    return [];
  },
};

export default nextConfig;
