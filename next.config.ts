import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Paid exam questions are read from disk by this route only; they are not in /public.
  outputFileTracingIncludes: {
    "/api/content/[key]": ["./private-data/**/*.json"],
  },
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), browsing-topics=()" },
        ],
      },
    ];
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
      { source: "/reset-password", destination: "/login/reset", permanent: true },
      { source: "/update-password", destination: "/login/update", permanent: true },
      { source: "/mypage/:sub(cards|notifications|self-guide|payments|quote|documents)", destination: "/mypage", permanent: false },
      // Bare domain -> www is handled by Vercel domain settings
    ];
  },
};

export default nextConfig;
