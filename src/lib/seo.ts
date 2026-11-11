import type { Metadata } from "next";
import { SITE, socialLinks } from "./site";

type PageMeta = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
};

// Per-page metadata with canonical URL and share previews.
export function pageMeta({ title, description, path, image, noindex }: PageMeta): Metadata {
  const url = path === "/" ? SITE.url : SITE.url + path;
  const images = [image || "/og.jpg"];
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: SITE.name,
      url,
      title,
      description,
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "LocalBusiness"],
    "@id": SITE.url + "/#org",
    name: SITE.name,
    alternateName: ["호주유학", "AusUhak", "ausuhak"],
    url: SITE.url,
    logo: SITE.url + "/icon.png",
    image: SITE.url + "/og.jpg",
    description: SITE.description,
    telephone: SITE.phoneIntl,
    email: SITE.email,
    founder: {
      "@type": "Person",
      "@id": SITE.url + "/#wilson",
      name: "Wilson Kim",
      jobTitle: "호주 유학 상담 원장",
      description: "호주 대학 교직원 출신, 20년 경력의 호주 유학 상담가. QEAC(호주 교육 상담사 자격) E240 보유.",
      knowsAbout: ["호주 대학 진학", "호주 학생비자", "호주 의대 입시", "호주 간호학과", "호주 약대"],
      hasCredential: { "@type": "EducationalOccupationalCredential", name: "QEAC (Qualified Education Agent Counsellor) E240" },
      worksFor: { "@id": SITE.url + "/#org" },
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.officeAddress.street,
      addressLocality: SITE.officeAddress.locality,
      addressRegion: SITE.officeAddress.region,
      addressCountry: SITE.officeAddress.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE.officeAddress.lat, longitude: SITE.officeAddress.lng },
    hasMap: "https://map.naver.com/p/search/" + encodeURIComponent(SITE.officeAddress.full),
    priceRange: "상담 무료",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "10:00",
        closes: "19:00",
      },
    ],
    areaServed: ["KR", "AU"],
    knowsAbout: ["호주유학", "호주 대학 진학", "호주 학생비자", "호주 간호학과", "호주 약대", "호주 의대", "검정고시 해외대학"],
    sameAs: socialLinks(),
  };
}

// Tells Google the site's name, so results read "AusUhak(호주유학)" instead of the bare domain.
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE.url + "/#website",
    name: SITE.name,
    alternateName: ["AusUhak", "호주유학", "ausuhak.com"],
    url: SITE.url + "/",
    inLanguage: "ko-KR",
    publisher: { "@id": SITE.url + "/#org" },
  };
}

export function jsonLdScript(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.path === "/" ? SITE.url : SITE.url + it.path,
    })),
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
