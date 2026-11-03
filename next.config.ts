import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      // Old locale-prefixed URLs (next-intl era)
      { source: "/ko", destination: "/", permanent: true },
      { source: "/ko/:path*", destination: "/:path*", permanent: true },
      { source: "/en/:path+", destination: "/en", permanent: true },
      // Retired sections of the old site
      { source: "/consult", destination: "/#ask", permanent: true },
      { source: "/cost", destination: "/#ask", permanent: true },
      { source: "/staff/:path*", destination: "/", permanent: true },
      // Bare domain -> www is handled by Vercel domain settings
    ];
  },
};

export default nextConfig;
