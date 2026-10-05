// 빌드 후 소식(blogs) 글 시드 자동 등록 (Vercel 배포 시 실행).
// 운영 방식: Wilson 이 원문을 주면 → blog-seed/ 에 md 원고 + posts.json 항목 추가 → 배포되면 자동 발행.
// - env 없으면(로컬 빌드 등) 조용히 skip — 빌드를 절대 깨뜨리지 않는다 (항상 exit 0)
// - 이미 있는 글(slug 동일)은 건드리지 않는다 → admin 에서 수정한 내용이
//   재배포로 덮어써지는 일 없음. 순수 "없으면 넣기"만.
// - 신규 글은 published + published_at=now 로 등록 → 소식 게시판·메인 미리보기 노출.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.log("[seed-blog] env 없음 (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) → skip");
  process.exit(0);
}

// 이미 발행된 글 본문 교정 — 정확히 일치하는 문구만 치환 (멱등).
// 문구가 없는 글(관리자가 이미 고친 글 포함)은 건드리지 않는다.
const FIXUPS = [
  {
    match: "**호주유학 김구복** · QEAC 등록 유학상담사",
    replace:
      "궁금한 점은 언제든 **호주유학**으로 문의 주세요.\n\n**AUSUHAK 호주유학** · 호주 워킹홀리데이 · 학생비자 · 어학연수 · 대학진학 상담",
  },
  // 2026.10.2 학생비자 개편 시행 — 발표 시점에 쓴 글 2건에 업데이트 박스·시행 반영.
  // (각 replace 는 match 문구를 다시 포함하지 않아 멱등)
  {
    match: "호주 정부가 9월 17일, 최근 몇 년 사이 가장 큰 폭의 이민 제도 개편을 발표했습니다.",
    replace:
      "> ⚠️ **업데이트 (2026.10):** 이 글의 발표 내용이 **10월 2일부로 공식 시행**되었습니다. 확정 시행 내용과 예외·경과 규정은 [10/2 시행 공지](/news/student-visa-reform-in-force-2026-10)에서 확인하세요.\n\n호주 정부가 지난 9월 17일, 최근 몇 년 사이 가장 큰 폭의 이민 제도 개편을 발표했었습니다.",
  },
  {
    match: "## 아직 확정되지 않은 것 — 여기가 중요합니다\n\n- **시행일이 아직 발표되지 않았습니다.** 예외 과정·대상의 전체 목록도 미공개입니다.",
    replace:
      "## 시행 여부 — 업데이트됨\n\n- **(업데이트) 가족 동반 제한은 10월 2일부로 시행되었습니다.** 예외·경과 규정 세부는 [시행 공지](/news/student-visa-reform-in-force-2026-10)에서 확인하세요.",
  },
  {
    match: "\"일단 어학연수로 가서, 현지에서 과정을 바꾸지\" — 지금까지 많이 쓰이던 설계입니다.",
    replace:
      "> ⚠️ **업데이트 (2026.10):** 이 글 발행 직후 확인된 바로, 관련 규정이 **10월 2일부로 공식 시행**되었습니다(워홀 등 7개 비자의 호주 내 학생비자 신청 금지 포함). 확정 내용은 [10/2 시행 공지](/news/student-visa-reform-in-force-2026-10)를 보세요.\n\n\"일단 어학연수로 가서, 현지에서 과정을 바꾸지\" — 그동안 많이 쓰이던 설계입니다.",
  },
  {
    match: "## 발표된 방향 (아직 시행 전)",
    replace: "## 발표된 방향 (업데이트: 10월 2일부터 시행)",
  },
  {
    match:
      "- **시행일·수수료 등 세부는 미발표**입니다. 정부는 이번 개편 전체를 향후 12개월에 걸쳐 순차 시행한다고 밝혔습니다.",
    replace:
      "- **(업데이트) 온쇼어 신청 제한 등 핵심 조치는 10월 2일부로 시행되었습니다.** 나머지 항목(워홀 추첨제 등)은 향후 12개월에 걸쳐 순차 시행됩니다.",
  },
];

// 날짜 교정: 최초 일괄 등록 때(2026-08-27~29 UTC) 타임스탬프로 들어간 글만
// posts.json 의 published_at 으로 1회 보정한다. 보정된 날짜는 이 범위를 벗어나므로
// 이후 배포에서 다시 건드리지 않고, 관리자가 직접 바꾼 날짜도 유지된다.
const BULK_PREFIXES = ["2026-08-27", "2026-08-28", "2026-08-29"];

try {
  const sb = createClient(url, key);
  const seedDir = new URL("./blog-seed/", import.meta.url);
  const posts = JSON.parse(readFileSync(new URL("posts.json", seedDir), "utf8"));

  let inserted = 0;
  let skipped = 0;
  let fixed = 0;
  let failed = 0;

  for (const p of posts) {
    const { data: exists, error: selErr } = await sb
      .from("blogs")
      .select("id, body, published_at")
      .eq("slug", p.slug)
      .maybeSingle();
    if (selErr) {
      failed++;
      console.log(`[seed-blog] ✗ 조회 실패: ${p.slug} — ${selErr.message}`);
      continue;
    }
    if (exists) {
      const patch = {};
      let body = exists.body ?? "";
      for (const f of FIXUPS) {
        if (body.includes(f.match)) {
          body = body.split(f.match).join(f.replace);
          patch.body = body;
        }
      }
      if (
        p.published_at &&
        BULK_PREFIXES.some((d) => (exists.published_at ?? "").startsWith(d))
      ) {
        patch.published_at = new Date(p.published_at).toISOString();
      }
      if (Object.keys(patch).length > 0) {
        const { error: fixErr } = await sb.from("blogs").update(patch).eq("id", exists.id);
        if (fixErr) {
          failed++;
          console.log(`[seed-blog] ✗ 교정 실패: ${p.slug} — ${fixErr.message}`);
        } else {
          fixed++;
          console.log(`[seed-blog] ✎ 교정: ${p.slug} (${Object.keys(patch).join(", ")})`);
        }
      } else {
        skipped++;
      }
      continue;
    }

    const body = readFileSync(new URL(p.file, seedDir), "utf8");
    const { error: insErr } = await sb.from("blogs").insert({
      slug: p.slug,
      title: p.title,
      body,
      excerpt: p.excerpt ?? null,
      category: p.category ?? null,
      status: "published",
      published_at: p.published_at
        ? new Date(p.published_at).toISOString()
        : new Date().toISOString(),
    });
    if (insErr) {
      failed++;
      console.log(`[seed-blog] ✗ DB 실패: ${p.slug} — ${insErr.message}`);
      continue;
    }
    inserted++;
    console.log(`[seed-blog] ✓ 발행: [${p.category}] ${p.title}`);
  }

  console.log(`[seed-blog] 완료 — 신규 ${inserted} / 기존 유지 ${skipped} / 교정 ${fixed} / 실패 ${failed}`);

  // ── 공지 팝업 1회 설정 (2026.10.2 학생비자 개편 시행) ──
  // guard 키가 생긴 뒤에는 재실행하지 않는다 → 이후 Wilson 이 admin 에서
  // 팝업을 끄거나 내용을 바꿔도 배포가 덮어쓰지 않음.
  const NOTICE_GUARD = "notice_seed_visa_reform_202610";
  const { data: noticeGuard } = await sb
    .from("site_settings")
    .select("key")
    .eq("key", NOTICE_GUARD)
    .maybeSingle();
  if (!noticeGuard) {
    const noticeRows = [
      { key: "notice_active", value: "true" },
      { key: "notice_title", value: "학생비자 개편 10/2 시행" },
      {
        key: "notice_body",
        value:
          "10월 2일부터 워홀·방문비자 등으로는 호주 안에서 학생비자를 신청할 수 없고, 신규 학생비자의 배우자·자녀 동반도 원칙적으로 제한됩니다.\n이미 호주에 가족과 함께 계신 분들은 영향이 없습니다. 바뀐 내용과 지금 해야 할 일을 정리했습니다.",
      },
      { key: "notice_version", value: "20261005" },
      { key: "notice_slug", value: "student-visa-reform-in-force-2026-10" },
      { key: NOTICE_GUARD, value: new Date().toISOString() },
    ];
    let noticeOk = 0;
    for (const row of noticeRows) {
      const { error: nErr } = await sb
        .from("site_settings")
        .upsert(row, { onConflict: "key" });
      if (nErr) console.log(`[seed-blog] ✗ 공지 설정 실패: ${row.key} — ${nErr.message}`);
      else noticeOk++;
    }
    console.log(`[seed-blog] 📣 공지 팝업 설정 ${noticeOk}/${noticeRows.length}`);
  }
} catch (e) {
  console.log(`[seed-blog] 예외 → skip: ${e?.message ?? e}`);
}
process.exit(0);
