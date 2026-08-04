-- ═══════════════════════════════════════════════════════════
-- 042_fix_internal_faqs_alerts_2026.sql
-- internal_faqs(카드 원본)·wilson_alerts 사실 정정: 2026.7 비자비·
-- 워홀비·가디언 재정, GS 용어, 내부 문서 흔적 제거, 유료 상담 정책.
-- 문자열/정규식 치환이라 관리자 수정분 보존, 재실행 무해.
-- ═══════════════════════════════════════════════════════════

BEGIN;

UPDATE internal_faqs SET card_text = regexp_replace(card_text, '> \*\*참조 모듈\*\*:[^\n]*\n?', '', 'g') WHERE card_text ~ '> \*\*참조 모듈\*\*:[^\n]*\n?';
UPDATE internal_faqs SET wilson_note = regexp_replace(wilson_note, '> \*\*참조 모듈\*\*:[^\n]*\n?', '', 'g') WHERE wilson_note ~ '> \*\*참조 모듈\*\*:[^\n]*\n?';
UPDATE internal_faqs SET card_text = regexp_replace(card_text, '## 🔗 참조 모듈\s*\n(-[^\n]*\n?)*\n*', '', 'g') WHERE card_text ~ '## 🔗 참조 모듈\s*\n(-[^\n]*\n?)*\n*';
UPDATE internal_faqs SET wilson_note = regexp_replace(wilson_note, '## 🔗 참조 모듈\s*\n(-[^\n]*\n?)*\n*', '', 'g') WHERE wilson_note ~ '## 🔗 참조 모듈\s*\n(-[^\n]*\n?)*\n*';
UPDATE internal_faqs SET card_text = regexp_replace(card_text, '\n\*참조 모듈:[^\n]*\*', '', 'g') WHERE card_text ~ '\n\*참조 모듈:[^\n]*\*';
UPDATE internal_faqs SET wilson_note = regexp_replace(wilson_note, '\n\*참조 모듈:[^\n]*\*', '', 'g') WHERE wilson_note ~ '\n\*참조 모듈:[^\n]*\*';
UPDATE internal_faqs SET card_text = regexp_replace(card_text, '⭐ \*\*자세한 가이드는[^\n]*모듈[^\n]*\*\*\n?', '', 'g') WHERE card_text ~ '⭐ \*\*자세한 가이드는[^\n]*모듈[^\n]*\*\*\n?';
UPDATE internal_faqs SET wilson_note = regexp_replace(wilson_note, '⭐ \*\*자세한 가이드는[^\n]*모듈[^\n]*\*\*\n?', '', 'g') WHERE wilson_note ~ '⭐ \*\*자세한 가이드는[^\n]*모듈[^\n]*\*\*\n?';
UPDATE internal_faqs SET card_text = regexp_replace(card_text, '\*Source: 엑셀 가이드 \+ ([^\n]*)\*', '*기준 자료: \1*', 'g') WHERE card_text ~ '\*Source: 엑셀 가이드 \+ ([^\n]*)\*';
UPDATE internal_faqs SET wilson_note = regexp_replace(wilson_note, '\*Source: 엑셀 가이드 \+ ([^\n]*)\*', '*기준 자료: \1*', 'g') WHERE wilson_note ~ '\*Source: 엑셀 가이드 \+ ([^\n]*)\*';
UPDATE internal_faqs SET card_text = regexp_replace(card_text, 'Source: ', '기준 자료: ', 'g') WHERE card_text ~ 'Source: ';
UPDATE internal_faqs SET wilson_note = regexp_replace(wilson_note, 'Source: ', '기준 자료: ', 'g') WHERE wilson_note ~ 'Source: ';
UPDATE internal_faqs SET card_text = replace(card_text, '$24.95 (2025.07~)', '$26.44 (2026.07~)') WHERE card_text LIKE '%' || '$24.95 (2025.07~)' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '$24.95 (2025.07~)', '$26.44 (2026.07~)') WHERE wilson_note LIKE '%' || '$24.95 (2025.07~)' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '$24.95 2025.07~', '$26.44 2026.07~') WHERE card_text LIKE '%' || '$24.95 2025.07~' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '$24.95 2025.07~', '$26.44 2026.07~') WHERE wilson_note LIKE '%' || '$24.95 2025.07~' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '$24.95/시간 (2024.7~ 적용 중)', '$26.44/시간 (2026.7~ 적용 중)') WHERE card_text LIKE '%' || '$24.95/시간 (2024.7~ 적용 중)' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '$24.95/시간 (2024.7~ 적용 중)', '$26.44/시간 (2026.7~ 적용 중)') WHERE wilson_note LIKE '%' || '$24.95/시간 (2024.7~ 적용 중)' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '최저시급 $24.95 × 1.25 = 약 $31.19/시간', '최저시급 $26.44 × 1.25 = 약 $33.05/시간') WHERE card_text LIKE '%' || '최저시급 $24.95 × 1.25 = 약 $31.19/시간' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '최저시급 $24.95 × 1.25 = 약 $31.19/시간', '최저시급 $26.44 × 1.25 = 약 $33.05/시간') WHERE wilson_note LIKE '%' || '최저시급 $24.95 × 1.25 = 약 $31.19/시간' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '$24.95', '$26.44') WHERE card_text LIKE '%' || '$24.95' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '$24.95', '$26.44') WHERE wilson_note LIKE '%' || '$24.95' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '$31.19', '$33.05') WHERE card_text LIKE '%' || '$31.19' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '$31.19', '$33.05') WHERE wilson_note LIKE '%' || '$31.19' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '학생비자: $2,000 (또는 방문비자 $190)', '학생비자: $2,500 (또는 방문비자 $250, 2026.7~)') WHERE card_text LIKE '%' || '학생비자: $2,000 (또는 방문비자 $190)' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '학생비자: $2,000 (또는 방문비자 $190)', '학생비자: $2,500 (또는 방문비자 $250, 2026.7~)') WHERE wilson_note LIKE '%' || '학생비자: $2,000 (또는 방문비자 $190)' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '학생비자: $2,000', '학생비자: $2,500') WHERE card_text LIKE '%' || '학생비자: $2,000' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '학생비자: $2,000', '학생비자: $2,500') WHERE wilson_note LIKE '%' || '학생비자: $2,000' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '학생비자 $2,000', '학생비자 $2,500') WHERE card_text LIKE '%' || '학생비자 $2,000' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '학생비자 $2,000', '학생비자 $2,500') WHERE wilson_note LIKE '%' || '학생비자 $2,000' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '신청비 $2,000', '신청비 $2,500') WHERE card_text LIKE '%' || '신청비 $2,000' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '신청비 $2,000', '신청비 $2,500') WHERE wilson_note LIKE '%' || '신청비 $2,000' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '신청비: $2,000', '신청비: $2,500') WHERE card_text LIKE '%' || '신청비: $2,000' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '신청비: $2,000', '신청비: $2,500') WHERE wilson_note LIKE '%' || '신청비: $2,000' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '워홀 비자 (417): $670 (2025.7 인상)', '워홀 비자 (417): $840 (2026.7 인상)') WHERE card_text LIKE '%' || '워홀 비자 (417): $670 (2025.7 인상)' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '워홀 비자 (417): $670 (2025.7 인상)', '워홀 비자 (417): $840 (2026.7 인상)') WHERE wilson_note LIKE '%' || '워홀 비자 (417): $670 (2025.7 인상)' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '(417): $670', '(417): $840') WHERE card_text LIKE '%' || '(417): $670' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '(417): $670', '(417): $840') WHERE wilson_note LIKE '%' || '(417): $670' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '가디언 본인: **연 $24,505 AUD**', '가디언 본인: **연 $29,710 AUD** (2026 현재)') WHERE card_text LIKE '%' || '가디언 본인: **연 $24,505 AUD**' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '가디언 본인: **연 $24,505 AUD**', '가디언 본인: **연 $29,710 AUD** (2026 현재)') WHERE wilson_note LIKE '%' || '가디언 본인: **연 $24,505 AUD**' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '동반 자녀(학생 외): 추가 **$8,574 AUD/명**', '동반 자녀(학생 외): 추가 **$4,449 AUD/명** · 학령기 자녀 학비 별도(연 $13,502)') WHERE card_text LIKE '%' || '동반 자녀(학생 외): 추가 **$8,574 AUD/명**' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '동반 자녀(학생 외): 추가 **$8,574 AUD/명**', '동반 자녀(학생 외): 추가 **$4,449 AUD/명** · 학령기 자녀 학비 별도(연 $13,502)') WHERE wilson_note LIKE '%' || '동반 자녀(학생 외): 추가 **$8,574 AUD/명**' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '$2,000 + $24,505/년', '$2,500 + $29,710/년') WHERE card_text LIKE '%' || '$2,000 + $24,505/년' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '$2,000 + $24,505/년', '$2,500 + $29,710/년') WHERE wilson_note LIKE '%' || '$2,000 + $24,505/년' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '$24,505', '$29,710') WHERE card_text LIKE '%' || '$24,505' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '$24,505', '$29,710') WHERE wilson_note LIKE '%' || '$24,505' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '$8,574', '$4,449') WHERE card_text LIKE '%' || '$8,574' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '$8,574', '$4,449') WHERE wilson_note LIKE '%' || '$8,574' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '방문비자 $190', '방문비자 $250 (2026.7~)') WHERE card_text LIKE '%' || '방문비자 $190' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '방문비자 $190', '방문비자 $250 (2026.7~)') WHERE wilson_note LIKE '%' || '방문비자 $190' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '카드 작성용 한 줄 요약', '한 줄 요약') WHERE card_text LIKE '%' || '카드 작성용 한 줄 요약' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '카드 작성용 한 줄 요약', '한 줄 요약') WHERE wilson_note LIKE '%' || '카드 작성용 한 줄 요약' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '학생 노출 카드 7장 구성', '진단 결과에서 확인하게 될 7가지') WHERE card_text LIKE '%' || '학생 노출 카드 7장 구성' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '학생 노출 카드 7장 구성', '진단 결과에서 확인하게 될 7가지') WHERE wilson_note LIKE '%' || '학생 노출 카드 7장 구성' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '학생 노출 카드 7장', '진단 결과에서 확인하게 될 7가지') WHERE card_text LIKE '%' || '학생 노출 카드 7장' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '학생 노출 카드 7장', '진단 결과에서 확인하게 될 7가지') WHERE wilson_note LIKE '%' || '학생 노출 카드 7장' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, ' (이번 모듈에서 다룸)', '') WHERE card_text LIKE '%' || ' (이번 모듈에서 다룸)' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, ' (이번 모듈에서 다룸)', '') WHERE wilson_note LIKE '%' || ' (이번 모듈에서 다룸)' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '선택 지역 모듈 가져오기', '선택 지역 맞춤 정보') WHERE card_text LIKE '%' || '선택 지역 모듈 가져오기' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '선택 지역 모듈 가져오기', '선택 지역 맞춤 정보') WHERE wilson_note LIKE '%' || '선택 지역 모듈 가져오기' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '선택 지역 모듈', '선택 지역 맞춤 정보') WHERE card_text LIKE '%' || '선택 지역 모듈' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '선택 지역 모듈', '선택 지역 맞춤 정보') WHERE wilson_note LIKE '%' || '선택 지역 모듈' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '전공 모듈 가져오기', '전공 맞춤 정보') WHERE card_text LIKE '%' || '전공 모듈 가져오기' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '전공 모듈 가져오기', '전공 맞춤 정보') WHERE wilson_note LIKE '%' || '전공 모듈 가져오기' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '전공 모듈', '전공 맞춤 정보') WHERE card_text LIKE '%' || '전공 모듈' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '전공 모듈', '전공 맞춤 정보') WHERE wilson_note LIKE '%' || '전공 모듈' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '(모듈명, 교수, 시설, 산업 연계 등)', '(커리큘럼 과목명, 교수, 시설, 산업 연계 등)') WHERE card_text LIKE '%' || '(모듈명, 교수, 시설, 산업 연계 등)' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '(모듈명, 교수, 시설, 산업 연계 등)', '(커리큘럼 과목명, 교수, 시설, 산업 연계 등)') WHERE wilson_note LIKE '%' || '(모듈명, 교수, 시설, 산업 연계 등)' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '학교 모듈명, 교수, 시설 등 확인 필수', '학교 커리큘럼 과목명, 교수, 시설 등 확인 필수') WHERE card_text LIKE '%' || '학교 모듈명, 교수, 시설 등 확인 필수' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '학교 모듈명, 교수, 시설 등 확인 필수', '학교 커리큘럼 과목명, 교수, 시설 등 확인 필수') WHERE wilson_note LIKE '%' || '학교 모듈명, 교수, 시설 등 확인 필수' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '(학교 모듈명, 교수, 직장 정보 구체적으로)', '(학교 커리큘럼 과목명, 교수, 직장 정보 구체적으로)') WHERE card_text LIKE '%' || '(학교 모듈명, 교수, 직장 정보 구체적으로)' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '(학교 모듈명, 교수, 직장 정보 구체적으로)', '(학교 커리큘럼 과목명, 교수, 직장 정보 구체적으로)') WHERE wilson_note LIKE '%' || '(학교 모듈명, 교수, 직장 정보 구체적으로)' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '(모듈, 교수, 산업 연계)', '(커리큘럼 과목, 교수, 산업 연계)') WHERE card_text LIKE '%' || '(모듈, 교수, 산업 연계)' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '(모듈, 교수, 산업 연계)', '(커리큘럼 과목, 교수, 산업 연계)') WHERE wilson_note LIKE '%' || '(모듈, 교수, 산업 연계)' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, 'GTE Statement', 'GS 진술서') WHERE card_text LIKE '%' || 'GTE Statement' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, 'GTE Statement', 'GS 진술서') WHERE wilson_note LIKE '%' || 'GTE Statement' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, 'GTE 사유서', 'GS 진술서') WHERE card_text LIKE '%' || 'GTE 사유서' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, 'GTE 사유서', 'GS 진술서') WHERE wilson_note LIKE '%' || 'GTE 사유서' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, 'GTE 작성', 'GS 진술서 작성') WHERE card_text LIKE '%' || 'GTE 작성' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, 'GTE 작성', 'GS 진술서 작성') WHERE wilson_note LIKE '%' || 'GTE 작성' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, 'GTE 재평가', 'GS 재평가') WHERE card_text LIKE '%' || 'GTE 재평가' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, 'GTE 재평가', 'GS 재평가') WHERE wilson_note LIKE '%' || 'GTE 재평가' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, 'GTE 위반', 'GS 원칙 위반') WHERE card_text LIKE '%' || 'GTE 위반' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, 'GTE 위반', 'GS 원칙 위반') WHERE wilson_note LIKE '%' || 'GTE 위반' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, 'GTE 부정', 'GS 부정') WHERE card_text LIKE '%' || 'GTE 부정' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, 'GTE 부정', 'GS 부정') WHERE wilson_note LIKE '%' || 'GTE 부정' || '%';
UPDATE wilson_alerts_rules SET marketing_application = replace(marketing_application, '비교 끝 - 윌슨 무료 상담', '비교 끝 - 윌슨 1:1 상담') WHERE marketing_application LIKE '%윌슨 무료 상담%';

COMMIT;
