-- ═══════════════════════════════════════════════════════════
-- 033_blogs_videos_ads.sql
-- 콘텐츠·마케팅 영역 3 테이블 — 블로그·유튜브·카톡 광고.
-- v1 admin CRUD 만. 공개 페이지는 메인 개편 시 노출.
-- ═══════════════════════════════════════════════════════════

-- ─── blogs ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blogs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL DEFAULT '',         -- markdown
  excerpt       TEXT,                              -- 메인·list 카드용 요약
  category      VARCHAR(50),                       -- 학교·비자·생활·합격사례·노하우
  status        VARCHAR(20) NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'published', 'archived')),
  author_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  view_count    INTEGER NOT NULL DEFAULT 0,
  published_at  TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blogs_status_pub ON blogs(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_category   ON blogs(category);

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS blogs_anon_published_select ON blogs;
CREATE POLICY blogs_anon_published_select
  ON blogs FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS blogs_admin_all ON blogs;
CREATE POLICY blogs_admin_all
  ON blogs FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE OR REPLACE FUNCTION trg_blogs_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := NOW(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS blogs_updated_at ON blogs;
CREATE TRIGGER blogs_updated_at BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION trg_blogs_updated_at();

-- ─── videos ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS videos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id     TEXT UNIQUE,                       -- 11자 YouTube ID (URL 에서 추출)
  youtube_url    TEXT NOT NULL,                     -- 원본 URL
  title          TEXT NOT NULL,
  description    TEXT,
  thumbnail_url  TEXT,                              -- 사용자 입력 또는 자동
  category       VARCHAR(50),                       -- 학교 소개·합격 후기·비자·생활·노하우
  display_order  INTEGER NOT NULL DEFAULT 0,
  status         VARCHAR(20) NOT NULL DEFAULT 'published'
                 CHECK (status IN ('draft', 'published', 'archived')),
  published_at   TIMESTAMP,
  created_at     TIMESTAMP DEFAULT NOW(),
  updated_at     TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_status_order ON videos(status, display_order, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_category     ON videos(category);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS videos_anon_published_select ON videos;
CREATE POLICY videos_anon_published_select
  ON videos FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS videos_admin_all ON videos;
CREATE POLICY videos_admin_all
  ON videos FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE OR REPLACE FUNCTION trg_videos_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := NOW(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS videos_updated_at ON videos;
CREATE TRIGGER videos_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION trg_videos_updated_at();

-- ─── ad_campaigns ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  source_tag    VARCHAR(50) NOT NULL,            -- students.source 와 매칭 (예: kakao_ad_spring2026)
  start_date    DATE,
  end_date      DATE,
  budget_krw    NUMERIC(12, 0) DEFAULT 0,
  spent_krw     NUMERIC(12, 0) DEFAULT 0,        -- 실제 집행 (Wilson 수기 입력)
  note          TEXT,
  status        VARCHAR(20) NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'paused', 'ended')),
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_source ON ad_campaigns(source_tag);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON ad_campaigns(status, start_date DESC);

ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ad_campaigns_admin_all ON ad_campaigns;
CREATE POLICY ad_campaigns_admin_all
  ON ad_campaigns FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());
-- 광고 데이터는 admin 전용 (학생 노출 X).

CREATE OR REPLACE FUNCTION trg_ad_campaigns_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := NOW(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS ad_campaigns_updated_at ON ad_campaigns;
CREATE TRIGGER ad_campaigns_updated_at BEFORE UPDATE ON ad_campaigns
  FOR EACH ROW EXECUTE FUNCTION trg_ad_campaigns_updated_at();

COMMENT ON TABLE blogs IS 'Phase 4 — admin/blog 글 관리. 메인 개편 시 /blog 공개.';
COMMENT ON TABLE videos IS 'Phase 3 — admin/youtube 영상 메타. v1=수동 / v2=YouTube Data API sync.';
COMMENT ON TABLE ad_campaigns IS 'Phase 4 — admin/ads 캠페인. source_tag = students.source 와 매칭하여 conversion 카운트.';
