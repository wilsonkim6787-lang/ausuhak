import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

// 배포된 사이트가 "지금 실제로" 공개 데이터를 어떻게 읽고 있는지 확인하는 점검 주소.
// - 방문자와 똑같은 익명(anon) 권한으로 조회 → 화면에 안 뜨는 원인(데이터 없음 / 권한 / 연결)을 구분.
// - 개수·상태 코드만 반환하고 키·개인정보는 포함하지 않는다. (robots.txt 에서 /api/ 수집 차단)
export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  let host = "미설정";
  try {
    host = new URL(supabaseUrl).hostname;
  } catch {
    /* 미설정/잘못된 URL */
  }
  // 어느 DB를 보는지만 구분할 수 있게 앞 6자만 노출
  const database = host === "미설정" ? host : `${host.slice(0, 6)}…`;

  const sb = createPublicClient();
  const [offers, blogs, gallery] = await Promise.all([
    sb.from("offers").select("id, image_path").eq("status", "published"),
    sb.from("blogs").select("id", { count: "exact", head: true }).eq("status", "published"),
    sb.from("gallery").select("id", { count: "exact", head: true }).eq("status", "published"),
  ]);

  const offerRows = offers.data ?? [];
  const firstImage = offerRows.find((r) => r.image_path)?.image_path as string | undefined;
  let firstImageStatus: number | string = "해당없음";
  if (firstImage) {
    try {
      const res = await fetch(
        `${supabaseUrl}/storage/v1/object/public/offers/${encodeURI(firstImage)}`,
        { method: "HEAD", cache: "no-store" },
      );
      firstImageStatus = res.status;
    } catch {
      firstImageStatus = "요청 실패";
    }
  }

  const report = {
    점검시각: new Date().toISOString(),
    배포환경: process.env.VERCEL_ENV ?? "local",
    배포버전: (process.env.VERCEL_GIT_COMMIT_SHA ?? "").slice(0, 7) || "local",
    데이터베이스: database,
    합격증_공개: offerRows.length,
    합격증_이미지있음: offerRows.filter((r) => r.image_path).length,
    합격증_첫이미지_응답: firstImageStatus,
    합격증_오류: offers.error?.message ?? null,
    소식_공개: blogs.count ?? 0,
    소식_오류: blogs.error?.message ?? null,
    갤러리_공개: gallery.count ?? 0,
    갤러리_오류: gallery.error?.message ?? null,
  };

  // 휴대폰 브라우저에서 바로 읽히도록 들여쓰기 출력
  return new NextResponse(JSON.stringify(report, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
