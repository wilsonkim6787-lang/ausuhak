-- 043_fee_history_cleanup.sql
-- 비자비·점수 인상 연혁 서술 제거 — 현재 금액·기준일만 표기
-- (staff_manuals + internal_faqs) 재실행 무해

BEGIN;

UPDATE staff_manuals SET content = regexp_replace(content, ',? ?[(]?(이전|기존) [$][0-9,]+(에서 100% 인상|에서 인상)?[)]?', '', 'g') WHERE content ~ '(이전|기존) [$][0-9,]+';
UPDATE staff_manuals SET content = replace(content, '2026.03.01 인상', '2026.07.01~') WHERE content LIKE '%' || '2026.03.01 인상' || '%';
UPDATE staff_manuals SET content = replace(content, '2026.07.01 인상', '2026.07.01~') WHERE content LIKE '%' || '2026.07.01 인상' || '%';
UPDATE staff_manuals SET content = replace(content, '2026.03.01부터', '2026.07.01부터') WHERE content LIKE '%' || '2026.03.01부터' || '%';
UPDATE staff_manuals SET content = replace(content, '부터 인상', '부터') WHERE content LIKE '%' || '부터 인상' || '%';
UPDATE staff_manuals SET search_text = regexp_replace(search_text, ',? ?[(]?(이전|기존) [$][0-9,]+(에서 100% 인상|에서 인상)?[)]?', '', 'g') WHERE search_text ~ '(이전|기존) [$][0-9,]+';
UPDATE staff_manuals SET search_text = replace(search_text, '2026.03.01 인상', '2026.07.01~') WHERE search_text LIKE '%' || '2026.03.01 인상' || '%';
UPDATE staff_manuals SET search_text = replace(search_text, '2026.07.01 인상', '2026.07.01~') WHERE search_text LIKE '%' || '2026.07.01 인상' || '%';
UPDATE staff_manuals SET search_text = replace(search_text, '2026.03.01부터', '2026.07.01부터') WHERE search_text LIKE '%' || '2026.03.01부터' || '%';
UPDATE staff_manuals SET search_text = replace(search_text, '부터 인상', '부터') WHERE search_text LIKE '%' || '부터 인상' || '%';
UPDATE internal_faqs SET card_text = regexp_replace(card_text, ',? ?[(]?(이전|기존) [$][0-9,]+(에서 100% 인상|에서 인상)?[)]?', '', 'g') WHERE card_text ~ '(이전|기존) [$][0-9,]+';
UPDATE internal_faqs SET card_text = replace(card_text, '2026.03.01 인상', '2026.07.01~') WHERE card_text LIKE '%' || '2026.03.01 인상' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '2026.07.01 인상', '2026.07.01~') WHERE card_text LIKE '%' || '2026.07.01 인상' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '2026.03.01부터', '2026.07.01부터') WHERE card_text LIKE '%' || '2026.03.01부터' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '부터 인상', '부터') WHERE card_text LIKE '%' || '부터 인상' || '%';
UPDATE internal_faqs SET wilson_note = regexp_replace(wilson_note, ',? ?[(]?(이전|기존) [$][0-9,]+(에서 100% 인상|에서 인상)?[)]?', '', 'g') WHERE wilson_note ~ '(이전|기존) [$][0-9,]+';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '2026.03.01 인상', '2026.07.01~') WHERE wilson_note LIKE '%' || '2026.03.01 인상' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '2026.07.01 인상', '2026.07.01~') WHERE wilson_note LIKE '%' || '2026.07.01 인상' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '2026.03.01부터', '2026.07.01부터') WHERE wilson_note LIKE '%' || '2026.03.01부터' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '부터 인상', '부터') WHERE wilson_note LIKE '%' || '부터 인상' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '**약 5,750 AUD** ⚠️ (2026.7.1 인상, 이전 4,600)', '**약 5,750 AUD** (2026.7.1~)') WHERE card_text LIKE '%' || '**약 5,750 AUD** ⚠️ (2026.7.1 인상, 이전 4,600)' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '**약 5,750 AUD** ⚠️ (2026.7.1 인상, 이전 4,600)', '**약 5,750 AUD** (2026.7.1~)') WHERE wilson_note LIKE '%' || '**약 5,750 AUD** ⚠️ (2026.7.1 인상, 이전 4,600)' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '⚠️ **2026년 3월 1일부터 신청비 두 배 인상** — 정확한 금액은 신청 시점 Department of Home Affairs 확인 필수', '⚠️ 신청비는 변동될 수 있으니 신청 시점에 Department of Home Affairs에서 최신 금액 확인 필수') WHERE card_text LIKE '%' || '⚠️ **2026년 3월 1일부터 신청비 두 배 인상** — 정확한 금액은 신청 시점 Department of Home Affairs 확인 필수' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '⚠️ **2026년 3월 1일부터 신청비 두 배 인상** — 정확한 금액은 신청 시점 Department of Home Affairs 확인 필수', '⚠️ 신청비는 변동될 수 있으니 신청 시점에 Department of Home Affairs에서 최신 금액 확인 필수') WHERE wilson_note LIKE '%' || '⚠️ **2026년 3월 1일부터 신청비 두 배 인상** — 정확한 금액은 신청 시점 Department of Home Affairs 확인 필수' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '6. 영어 IELTS 6.5로 인상 (이전 6.0) — 2024.3', '6. 영어 IELTS 6.5 (2024.3~)') WHERE card_text LIKE '%' || '6. 영어 IELTS 6.5로 인상 (이전 6.0) — 2024.3' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '6. 영어 IELTS 6.5로 인상 (이전 6.0) — 2024.3', '6. 영어 IELTS 6.5 (2024.3~)') WHERE wilson_note LIKE '%' || '6. 영어 IELTS 6.5로 인상 (이전 6.0) — 2024.3' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '7. 신청비 두 배 인상: 2,300 → 4,600 AUD — 2026.3.1
8. 25% 인상: 4,600 → 5,750 AUD — 2026.7.1', '7. 신청비 5,750 AUD (2026.7.1~)') WHERE card_text LIKE '%' || '7. 신청비 두 배 인상: 2,300 → 4,600 AUD — 2026.3.1
8. 25% 인상: 4,600 → 5,750 AUD — 2026.7.1' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '7. 신청비 두 배 인상: 2,300 → 4,600 AUD — 2026.3.1
8. 25% 인상: 4,600 → 5,750 AUD — 2026.7.1', '7. 신청비 5,750 AUD (2026.7.1~)') WHERE wilson_note LIKE '%' || '7. 신청비 두 배 인상: 2,300 → 4,600 AUD — 2026.3.1
8. 25% 인상: 4,600 → 5,750 AUD — 2026.7.1' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, ' (이전 6.0에서 인상)', '') WHERE card_text LIKE '%' || ' (이전 6.0에서 인상)' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, ' (이전 6.0에서 인상)', '') WHERE wilson_note LIKE '%' || ' (이전 6.0에서 인상)' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '**24년에 학생비자 신청비가 710 → 2,000 AUD로 약 3배 인상됨** (호주 정부의 학생수 관리 정책)', '**학생비자 신청비 $2,500 (2026.7~)** — 호주 정부의 학생수 관리 정책으로 높은 수준 유지') WHERE card_text LIKE '%' || '**24년에 학생비자 신청비가 710 → 2,000 AUD로 약 3배 인상됨** (호주 정부의 학생수 관리 정책)' || '%';
UPDATE internal_faqs SET wilson_note = replace(wilson_note, '**24년에 학생비자 신청비가 710 → 2,000 AUD로 약 3배 인상됨** (호주 정부의 학생수 관리 정책)', '**학생비자 신청비 $2,500 (2026.7~)** — 호주 정부의 학생수 관리 정책으로 높은 수준 유지') WHERE wilson_note LIKE '%' || '**24년에 학생비자 신청비가 710 → 2,000 AUD로 약 3배 인상됨** (호주 정부의 학생수 관리 정책)' || '%';

UPDATE staff_manuals SET content = replace(content, '(2024 인상, 2026 현재 유지)', '(2026 현재 기준)') WHERE content LIKE '%' || '(2024 인상, 2026 현재 유지)' || '%';
UPDATE staff_manuals SET search_text = replace(search_text, '(2024 인상, 2026 현재 유지)', '(2026 현재 기준)') WHERE search_text LIKE '%' || '(2024 인상, 2026 현재 유지)' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '(2024 인상, 2026 현재 유지)', '(2026 현재 기준)') WHERE card_text LIKE '%' || '(2024 인상, 2026 현재 유지)' || '%';
UPDATE staff_manuals SET content = replace(content, '$29,710 2024.10 인상', '$29,710 (2026 현재)') WHERE content LIKE '%' || '$29,710 2024.10 인상' || '%';
UPDATE staff_manuals SET search_text = replace(search_text, '$29,710 2024.10 인상', '$29,710 (2026 현재)') WHERE search_text LIKE '%' || '$29,710 2024.10 인상' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '$29,710 2024.10 인상', '$29,710 (2026 현재)') WHERE card_text LIKE '%' || '$29,710 2024.10 인상' || '%';
UPDATE staff_manuals SET content = replace(content, '2024.10 생활비 기준 인상 공식', '생활비 기준 공식 안내') WHERE content LIKE '%' || '2024.10 생활비 기준 인상 공식' || '%';
UPDATE staff_manuals SET search_text = replace(search_text, '2024.10 생활비 기준 인상 공식', '생활비 기준 공식 안내') WHERE search_text LIKE '%' || '2024.10 생활비 기준 인상 공식' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '2024.10 생활비 기준 인상 공식', '생활비 기준 공식 안내') WHERE card_text LIKE '%' || '2024.10 생활비 기준 인상 공식' || '%';
UPDATE staff_manuals SET content = replace(content, '(예전엔 38%였음, 2017 인상)', '') WHERE content LIKE '%' || '(예전엔 38%였음, 2017 인상)' || '%';
UPDATE staff_manuals SET search_text = replace(search_text, '(예전엔 38%였음, 2017 인상)', '') WHERE search_text LIKE '%' || '(예전엔 38%였음, 2017 인상)' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '(예전엔 38%였음, 2017 인상)', '') WHERE card_text LIKE '%' || '(예전엔 38%였음, 2017 인상)' || '%';
UPDATE staff_manuals SET content = replace(content, '예전엔 38%였음, 2017 인상 ', '') WHERE content LIKE '%' || '예전엔 38%였음, 2017 인상 ' || '%';
UPDATE staff_manuals SET search_text = replace(search_text, '예전엔 38%였음, 2017 인상 ', '') WHERE search_text LIKE '%' || '예전엔 38%였음, 2017 인상 ' || '%';
UPDATE internal_faqs SET card_text = replace(card_text, '예전엔 38%였음, 2017 인상 ', '') WHERE card_text LIKE '%' || '예전엔 38%였음, 2017 인상 ' || '%';

UPDATE staff_manuals SET content = replace(content, '(2026.07 인상)', '(2026.07~)'), search_text = replace(search_text, '(2026.07 인상)', '(2026.07~)') WHERE content LIKE '%' || '(2026.07 인상)' || '%' OR search_text LIKE '%' || '(2026.07 인상)' || '%';
UPDATE staff_manuals SET content = replace(content, '**영어 요건: IELTS 6.5 (각 5.5)** 인상', '**영어 요건: IELTS 6.5 (각 5.5)**'), search_text = replace(search_text, '**영어 요건: IELTS 6.5 (각 5.5)** 인상', '**영어 요건: IELTS 6.5 (각 5.5)**') WHERE content LIKE '%' || '**영어 요건: IELTS 6.5 (각 5.5)** 인상' || '%' OR search_text LIKE '%' || '**영어 요건: IELTS 6.5 (각 5.5)** 인상' || '%';

COMMIT;
