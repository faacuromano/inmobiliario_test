import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://panoee.com https://tour.panoee.net https://*.panoee.com;",
          },
          {
            key: "X-Frame-Options",
            value: "ALLOWALL", // Fallback
          },
        ],
      },
    ];
  },
};

export default nextConfig;
