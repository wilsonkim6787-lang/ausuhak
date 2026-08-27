// robots.txt — 관리자·직원·학생 전용 영역 수집 차단 + sitemap 안내.
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/staff",
          "/mypage",
          "/api/",
          "/login",
          "/signup",
          "/reset-password",
          "/update-password",
          "/auth/",
        ],
      },
    ],
    sitemap: "https://ausuhak.com/sitemap.xml",
  };
}
