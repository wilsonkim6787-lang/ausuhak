-- ═══════════════════════════════════════════════════════════
-- 012_initial_settings.sql
-- 사양서 PART D-8 / PART E-16: site_settings (사이트 정보)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS site_settings (
  id          SERIAL PRIMARY KEY,
  key         VARCHAR(50) UNIQUE NOT NULL,
  value       TEXT,
  value_en    TEXT,                                         -- 영문 사이트용
  category    VARCHAR(30),
  -- 'company' / 'contact' / 'business' / 'kakao' / 'pricing' / 'legal'
  is_public   BOOLEAN DEFAULT true,                         -- 푸터 노출 여부
  updated_by  UUID REFERENCES users(id),
  updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settings_category ON site_settings(category);

-- 초기 데이터 (Wilson이 관리자 페이지에서 직접 입력 / Phase 1.7)
INSERT INTO site_settings (key, value, value_en, category, is_public) VALUES
  ('company_name',      'ausuhak.com (호주유학)',          'ausuhak.com',                          'company',  true),
  ('business_number',   '[입력 필요]',                      '[Enter]',                              'company',  true),
  ('representative',    'Wilson Kim',                       'Wilson Kim (QEAC E240)',               'company',  true),
  ('address',           '[입력 필요]',                      '[Enter]',                              'contact',  true),
  ('phone',             '[입력 필요]',                      '[Enter]',                              'contact',  true),
  ('email',             '[입력 필요]',                      '[Enter]',                              'contact',  true),
  ('email_partnership', NULL,                               'partnership@ausuhak.com',              'contact',  true),
  ('kakao_channel_url', 'https://pf.kakao.com/_GadTX',      NULL,                                   'kakao',    true),
  ('business_hours',    '평일 10:00 ~ 18:00 (KST)',         'Mon-Fri 10:00-18:00 KST',              'business', true),
  ('holidays',          '주말 / 공휴일 휴무',                'Closed weekends & public holidays',    'business', true),
  ('price_pro',         '50000',                            '50000',                                'pricing',  true),
  ('price_medical',     '300000',                           '300000',                               'pricing',  true)
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE site_settings IS 'PART E-16: Wilson 관리자 페이지에서 수정 → 사이트 즉시 반영. is_public=true는 푸터 노출';
