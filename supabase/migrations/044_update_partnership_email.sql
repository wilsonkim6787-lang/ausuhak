-- 044: 파트너십 연락 이메일 교체.
-- partnership@ausuhak.com 미사용 메일함 → 실제 수신 가능한 wilsonkim6787@gmail.com.
-- 관리자가 이미 다른 값으로 바꾼 경우 건드리지 않음 (idempotent).

UPDATE site_settings
SET value_en = 'wilsonkim6787@gmail.com'
WHERE key = 'email_partnership'
  AND value_en = 'partnership@ausuhak.com';
