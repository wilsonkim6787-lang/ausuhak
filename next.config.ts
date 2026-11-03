import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
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
