-- 047: 메인 공지 팝업 복구 — notice_* 키를 is_public=true 로.
-- 메인 페이지는 anon 클라이언트로 site_settings 를 읽는데,
-- RLS(settings_public_select: is_public = true OR is_super_admin())가
-- is_public=false 인 notice_* 행을 숨겨 공지 팝업이 절대 표시되지 않았다.
-- (admin/blog·admin/settings 액션도 같은 시점에 is_public: true 로 수정됨)

UPDATE site_settings
SET is_public = true
WHERE key IN (
  'notice_active',
  'notice_title',
  'notice_body',
  'notice_version',
  'notice_slug',
  'notice_blog_id'
);
