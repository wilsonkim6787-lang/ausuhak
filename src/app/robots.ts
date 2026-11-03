import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Preview deployments must not be indexed; only production is.
  const isProd = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : true;
  if (!isProd) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/mypage", "/api/", "/login", "/signup"] }],
    sitemap: SITE.url + "/sitemap.xml",
    host: SITE.url,
  };
}
