import { getTranslations } from "next-intl/server";
import { FAQ_CATEGORIES, getTotalCount } from "@/data/faqs";
import FAQPreviewClient from "./FAQPreviewClient";

export default async function FAQPreview() {
  const t = await getTranslations("FAQPreview");
  const total = getTotalCount();

  return (
    <FAQPreviewClient
      categories={FAQ_CATEGORIES}
      total={total}
      labels={{
        eyebrow: t("eyebrow"),
        title: t("title"),
        subtitle: t("subtitle"),
        seeAllLabel: t("seeAllLabel"),
        ctaTitle: t("ctaTitle"),
        ctaBody: t("ctaBody"),
        ctaKakao: t("ctaKakao"),
      }}
    />
  );
}
