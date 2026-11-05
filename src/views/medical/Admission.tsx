// @ts-nocheck
"use client";
/* eslint-disable */
// Generated from Admission.dc.html by tools/dc2tsx.py. Edit the generator input, not this file, for layout changes.
import { Fragment } from "react";
import { DCLogic, css } from "@/lib/dc";

class Component extends DCLogic {
  constructor(props) { super(props); this.state = { tab: 'direct' }; }
  renderVals() {
    var self = this;
    var S = this.state;
    var BOX = [
      'background: #C8432F; color: #FFFFFF; border-radius: 14px; padding: 24px; display: flex; flex-direction: column; gap: 12px',
      'background: #0B1F3A; color: #FFFFFF; border-radius: 14px; padding: 24px; display: flex; flex-direction: column; gap: 12px',
      'background: #0F6E5A; color: #FFFFFF; border-radius: 14px; padding: 24px; display: flex; flex-direction: column; gap: 12px',
      'background: #3A4A8C; color: #FFFFFF; border-radius: 14px; padding: 24px; display: flex; flex-direction: column; gap: 12px'
    ];
    var P = {
      direct: {
        label: '고교 직행', badge: 'TRACK 1 · 고교 졸업 후 바로', title: '고등학교 졸업 후 바로 의대·치대로',
        lead: '한국 고교나 국제학교를 졸업(예정)한 학생이 학부 과정 없이 5~6년제 의대·치대에 바로 들어가는 길입니다. 고교 성적, 입학시험(대학에 따라 ISAT 또는 UCAT ANZ), 영어, 인터뷰로 선발합니다.',
        who: ['한국 고교 또는 국제학교 고3·졸업생', '수능 또는 내신 성적이 최상위권인 학생', '대학별로 ISAT 또는 UCAT ANZ 중 하나를 준비할 수 있는 학생'],
        conds: [
          { n: '01', title: '최상위 고교 성적', items: ['모나쉬 수능 380 또는 내신 95% (대학 안내 참고 점수)', 'UNSW 수능 370 · UQ 368 · UWA 362', '애들레이드 수능 350 (최저 참고치)'] },
          { n: '02', title: '입학시험', items: ['ISAT: 모나쉬·UNSW·UWA·WSU·태즈메이니아', 'UCAT ANZ: 애들레이드·UQ·뉴캐슬(JMP), UNSW는 둘 중 선택', '시험 없음: 커틴·제임스쿡'] },
          { n: '03', title: '영어', items: ['대부분 IELTS 7.0 (영역별 6.0~7.0)', 'TOEFL iBT·PTE 대체 가능 대학 다수', '성적 유효기간 2년 확인'] },
          { n: '04', title: '인터뷰', items: ['MMI 또는 패널, 국제학생은 대부분 Zoom 온라인', '모나쉬 MMI는 평생 1회만 응시 가능', '최종 합격의 30~60%를 인터뷰가 좌우하는 대학 다수'] }
        ],
        steps: [
          { n: 1, when: '고1~고2', title: '목표 대학·시험 결정', items: ['ISAT형인지 UCAT형인지 대학 조합 설계', '선수과목(화학 등) 이수 계획'] },
          { n: 2, when: '고2 말~고3', title: '시험·영어 준비', items: ['ISAT 연 4회 중 전략 회차 응시 (재응시는 12개월 후)', 'UCAT은 매년 7월 1회', 'IELTS 7.0 확보'] },
          { n: 3, when: '고3 6~11월', title: '원서 접수', items: ['모나쉬·UWA·애들레이드 6월 30일 전후', 'UQ 9월 30일 · UNSW 11월 30일 · WSU 수시'] },
          { n: 4, when: '7월~이듬해 1월', title: '인터뷰·합격·입학', items: ['인터뷰 후 순차 오퍼', '학생비자·출국 준비 후 2월 개강'] }
        ],
        head: ['대학', '입학시험', '고교 성적 기준', '영어', '마감 (2027학년도)', '연 학비 AUD'],
        rows: [
          ['모나쉬 Monash', 'ISAT 지원 170·영역별 165 · 2027 인터뷰 컷 178 (공식)', '수능 380 또는 내신 95% (대학 안내 참고 점수)', 'IELTS 7.0 (각 6.5)', '6월 30일', '107,240 (2027)'],
          ['UNSW', 'ISAT 165 이상 또는 UCAT 50백분위 이상', '수능 370', 'IELTS 7.0 (각 6.0)', '11월 30일', '95,500 (2026, 1학년)'],
          ['UWA (Assured Pathway)', 'ISAT 두 영역 25백분위 이상', 'ATAR 98 · 수능 362 (치의학 안내 기준)', 'IELTS 6.5', '6월 30일', '학부 51,400 → MD 92,900 (2026)'],
          ['웨스턴시드니 WSU', 'ISAT (지원자 많을 때 순위용)', 'ATAR 93.5 상당 (수능 기준 미공개)', 'IELTS 7.0 (각 7.0)', '연중 수시', '85,520 (2026)'],
          ['태즈메이니아 UTAS', 'ISAT 170 (CR·QR 각 165) 또는 MCAT 491 또는 UCAT ANZ 50백분위', 'ATAR 90 상당 (수능 기준은 상담 때 안내)', 'IELTS 7.0 (각 7.0)', '4회 라운드 · 최종 11월 30일', '92,950 (2027)'],
          ['시드니 Double Degree Medicine', 'UCAT 없음 · 인터뷰 + 필기 평가', 'ATAR 99.95 상당', '상담 때 안내', 'UAC 12월 13일 · 1월 10일', '상담 때 안내 · 국제 10명'],
          ['애들레이드 의대·치대', 'UCAT ANZ', '수능 350 (최저 참고치)', 'IELTS 7.0 (각 7.0)', '6월 30일', '99,000 / 108,300 (2027)'],
          ['UQ 의대 (Provisional)', 'UCAT ANZ + MMI (ISAT 불인정)', '수능 368', 'IELTS 7.0 (각 7.0)', '9월 30일', 'UQ 학사 학비 + MD 109,328 (2027)'],
          ['UQ 치대', 'UCAT ANZ', '수능 381 · ATAR 99', 'IELTS 7.0 (각 7.0)', '9월 30일', '99,600 (2027)'],
          ['뉴캐슬·UNE (JMP)', 'UCAT ANZ', '비공개', 'IELTS 7.0 (각 7.0)', '9월 4일', '상담 때 최신 금액 안내'],
          ['커틴 Curtin', '없음 (학업 40% + MMI 60%)', 'ATAR 95 상당, 한국 자격은 대학 문의', 'IELTS 7.0 (각 7.0)', '6월 20일', '100,782 (2027, 1학년)'],
          ['제임스쿡 JCU 의대·치대', '없음 (의대는 온라인 인터뷰)', 'ATAR 94 상당, 한국 자격은 대학 문의', 'IELTS 7.0', '6월 30일', '74,952 / 82,936 (2027 예상)'],
          ['플린더스 Clinical Sciences/MD', '국제학생 시험 명시 없음 (ATAR 순위)', 'ATAR 95 상당, 1지망 필수', 'IELTS 7.0 (각 7.0)', '수시 (공지 없이 마감)', '54,900 (2027, 대학 표기)']
        ],
        notes: [
          '모나쉬는 고교 졸업 후 2년 이내, 대학 과정을 시작하지 않은 학생만 지원할 수 있습니다. 군 복무자는 예외가 있습니다.',
          'ISAT는 마지막 응시 후 12개월이 지나야 다시 볼 수 있어 응시 시점을 전략적으로 정해야 합니다.',
          'UQ와 애들레이드는 ISAT를 받지 않고 UCAT ANZ만 받습니다. UNSW는 둘 중 하나를 고를 수 있습니다.',
          '본드대학교는 국제학생의 고교 직행 입학을 받지 않습니다. 찰스스터트대학교 의대·치대는 국제학생 과정이 없습니다.',
          '국제학생은 졸업 후 호주 인턴십(수련의) 자리가 보장되지 않는다고 대학들이 명시합니다.'
        ]
      },
      foundation: {
        label: '파운데이션', badge: 'TRACK 2 · 1년 준비 과정 후', title: '파운데이션 1년 후 의대로',
        lead: '한국 고교 졸업장만으로 바로 지원하기 어렵거나 성적·영어를 1년 더 끌어올리고 싶은 학생이 대학 부설 파운데이션(예비 과정)을 마치고 그 점수로 의대에 지원하는 길입니다. 파운데이션 수료가 합격을 보장하지는 않습니다.',
        who: ['고2 수료 또는 고3 졸업 후 바로 호주로 가려는 학생', '수능 대신 호주 과정 성적으로 승부하고 싶은 학생', '영어를 현지에서 끌어올려야 하는 학생'],
        conds: [
          { n: '01', title: '파운데이션 고득점', items: ['모나쉬 MUFY 92% + 영어 75% + 화학 75%', 'UNSW Foundation 생명과학 GPA 9.0', 'UWA Foundation 86점 (= ATAR 98)'] },
          { n: '02', title: '입학시험', items: ['모나쉬 ISAT 170 (영역별 165)', 'UNSW ISAT 165 또는 UCAT 50백분위', 'UWA ISAT 두 영역 25백분위'] },
          { n: '03', title: '영어', items: ['파운데이션 입학: IELTS 5.0~6.0 수준', '의대 지원 시: IELTS 7.0 수준'] },
          { n: '04', title: '인터뷰', items: ['모나쉬 MMI 4스테이션', 'UNSW 면접관 2인 Zoom', 'UWA 50분 패널 (점수의 50%)'] }
        ],
        steps: [
          { n: 1, when: '고2~고3', title: '파운데이션 선택', items: ['연계 의대가 있는 과정인지 먼저 확인', '수능 260 또는 내신 기준으로 입학'] },
          { n: 2, when: '1년차 상반기', title: '현지 학업 시작', items: ['2·4·8·10월 등 과정별 입학', '화학·생물 등 선수과목 이수'] },
          { n: 3, when: '1년차 중반', title: 'ISAT·UCAT·원서', items: ['파운데이션 재학 중 시험 응시', '대학 의대 원서 제출'] },
          { n: 4, when: '1년차 말', title: '인터뷰·의대 입학', items: ['최종 점수 + 인터뷰로 선발', '모나쉬 연계 오퍼는 12월'] }
        ],
        head: ['파운데이션', '연계 의대', '의대 진학 조건', '파운데이션 학비 AUD', '입학 시기·기간', '비고'],
        rows: [
          ['Monash University Foundation Year (Monash College)', '모나쉬 의대', 'MUFY 92%·영어 75%·화학 75% + ISAT + MMI', 'Standard 38,400 / Extended 51,900 (2025)', '2월·8월, 12~18개월', '정원 제한 과정이라 수료해도 보장 없음'],
          ['UNSW Foundation Studies (UNSW College)', 'UNSW 의대', '생명과학 GPA 9.0 + ISAT 165 또는 UCAT 50백분위 + 인터뷰', 'Standard 43,650 / Standard Plus 48,750 (2027)', '4월·10월 등, 9~12개월', '별도 Foundation 지원서, 11월 30일 마감'],
          ['UWA Foundation Program (UWA College)', 'UWA Biomedicine → MD·DMD', '86점 + ISAT 25백분위 + 인터뷰', '상담 때 최신 금액 안내', '8~12개월', 'ATAR 30·인터뷰 50·ISAT 20 비율'],
          ['Trinity College Foundation (멜버른대)', '멜버른 Biomedicine (의대 직행 아님)', 'Trinity 90점이면 Biomedicine 보장 (2025), MD는 학사 후 의전원 지원', 'Standard 46,770 (2027)', '1·2·6·7·8·9월', '의사가 되려면 학사 + GAMSAT/MCAT 필요'],
          ['University of Sydney Foundation (Taylors)', '의대 직접 연계 안내 없음', '한국 입학: 수능 260 또는 고2 평균 4등급', '상담 때 최신 금액 안내', '과정별 상이', '시드니 의대는 의전원 중심'],
          ['UQ College Foundation', '의대·치대 연계 불가 (UQ 명시)', '한국 입학: 수능 260 또는 고2 GPA 3', '상담 때 최신 금액 안내', '4~10개월', 'UQ 의대는 UCAT 경로만 가능']
        ],
        notes: [
          '파운데이션은 "의대 연계가 공식적으로 열려 있는 과정"인지가 가장 중요합니다. 모나쉬·UNSW·UWA는 열려 있고, UQ는 막혀 있습니다.',
          '파운데이션을 마쳐도 정원이 있어 합격이 보장되지 않습니다. 동시에 일반 학부(바이오메디컬 등) 플랜 B를 함께 설계해야 합니다.',
          '파운데이션 학비와 의대 학비는 별도입니다.'
        ]
      },
      bachelor: {
        label: '학부 경유', badge: 'TRACK 3 · 학부 연계 보장형', title: '학부에서 시작해 의대로 이어지는 길',
        lead: '처음부터 의대에 입학하는 대신, 대학이 정한 학부 과정에서 일정 학점을 유지하면 의대(MD)·치대(DMD)로 이어지는 연계 경로입니다. 직행보다 기간이 길지만 입학 문턱이 다르게 설계되어 있습니다.',
        who: ['직행 경쟁에서 한 번 더 기회를 만들고 싶은 학생', '학부 생활을 하며 진로를 굳히고 싶은 학생', '학점 관리에 자신 있는 학생'],
        conds: [
          { n: '01', title: '학부 입학 성적', items: ['UWA ATAR 98 + ISAT + 인터뷰로 Assured Pathway 선발', 'UQ Provisional: 수능 368 + UCAT + MMI'] },
          { n: '02', title: '학부 학점 유지', items: ['UWA 첫 2년 GPA 5.5/7 이상', 'UQ 최소 기간 내 GPA 5.0/7 이상', '본드 GPA 3.0/4'] },
          { n: '03', title: '추가 평가', items: ['본드: 심리검사 + 인터뷰', '그리피스: 학부 GPA 5.5 (2025 자료)'] },
          { n: '04', title: '의대 전환', items: ['UWA 3+3년, UQ 학사 + MD 4년', '본드 2학년 편입'] }
        ],
        steps: [
          { n: 1, when: '고3', title: '연계 학부 지원', items: ['UWA Biomedicine (Specialised)', 'UQ Provisional entry'] },
          { n: 2, when: '학부 1~2년', title: '학점 관리', items: ['연계 조건 GPA 유지', '의대 필수 과목 이수'] },
          { n: 3, when: '학부 졸업', title: '의대 전환', items: ['조건 충족 시 MD·DMD 진학', '본드는 졸업 후 편입 지원'] },
          { n: 4, when: '이후 3~4년', title: '의대 과정', items: ['임상 실습', '졸업 후 인턴십 지원'] }
        ],
        head: ['경로', '학부 과정', '의대 전환 조건', '총 기간', '학비 AUD', '비고'],
        rows: [
          ['UWA Assured Pathway', 'Bachelor of Biomedicine (Specialised) 3년', '첫 2년 GPA 5.5 이상', '3 + 3년', 'Biomedicine 51,400 → MD 92,900 / DMD 93,700 (2026)', '국제 정원 MD 40·DMD 20 중 최대 절반'],
          ['UQ Provisional Entry', 'UQ 학사 (예: Biomedical Science)', '최소 기간 내 GPA 5.0 이상', '학사 + MD 4년', '학사 학비 + MD 109,328 (2027)', 'UCAT ANZ 필수, ISAT 불가'],
          ['본드 Lateral Entry', 'Bond Biomedical Science (Pre-Health) 등', 'GPA 3.0/4 + 심리검사 + 인터뷰', '학사 + 의대 2학년 편입', '상담 때 최신 금액 안내', '2025년 약 25명 편입, 보장 없음'],
          ['그리피스 Medical Science → MD', 'Bachelor of Medical Science 2년 (가속)', 'GPA 5.5 이상', '2 + 4년', '38,000 (2025, 학부)', '2027학년도 국제학생 개방 여부는 대학 공지 후 반영'],
          ['그리피스 치과 연계', 'Bachelor of Dental Health Science 3년', '졸업 후 Master of Dentistry 2년', '3 + 2년', '상담 때 최신 금액 안내', 'UCAT 필요']
        ],
        notes: [
          '연계 경로는 학부 학점 기준을 못 맞추면 의대로 넘어가지 못합니다. 입학 후 학점 관리가 핵심입니다.',
          '같은 대학 안에서만 이어지는 경로입니다. 다른 대학 학부 성적은 대부분 인정되지 않습니다.'
        ]
      },
      grad: {
        label: '의전원', badge: 'TRACK 4 · 학사 졸업 후', title: '학사 학위 후 의학전문대학원(MD)으로',
        lead: '국내외 4년제 학사 학위를 받은 뒤 4년제 MD(의대)·DMD/DDS(치대)에 지원하는 길입니다. 학부 학점(GPA), GAMSAT 또는 MCAT, 인터뷰로 선발하며 국제학생은 대학에 직접 지원합니다.',
        who: ['국내외 대학 재학·졸업생', '학부 학점 관리가 잘 된 학생 (7점 만점 5.0 이상)', '전공과 무관하게 의사를 목표로 하는 학생'],
        conds: [
          { n: '01', title: '학사 학위', items: ['전공 무관 (일부 치대는 해부·생리·생화학 선수)', '최근 학년 가중 GPA 계산 대학 다수'] },
          { n: '02', title: 'GPA', items: ['대부분 7점 만점 5.0 이상', 'UWA·울런공 5.5, 모나쉬 6.0'] },
          { n: '03', title: 'GAMSAT 또는 MCAT', items: ['GAMSAT 영역별 50 이상이 일반적', 'MCAT 492~504 (대학별)', 'UQ는 국제학생에게 MCAT만 받음'] },
          { n: '04', title: '인터뷰', items: ['MMI(녹화형·실시간), 패널', '울런공은 Casper 추가'] }
        ],
        steps: [
          { n: 1, when: '학부 2~3학년', title: '학점·시험 계획', items: ['GPA 관리', 'GAMSAT(3·9월) 또는 MCAT 선택'] },
          { n: 2, when: '졸업 1년 전', title: '시험 응시', items: ['GAMSAT 한국 시험장 없음 → 해외 응시 또는 원격 승인', 'MCAT은 한국 응시 가능 여부 확인'] },
          { n: 3, when: '4~10월', title: '원서 접수', items: ['대학별 직접 지원 (GEMSAS 아님)', '마감이 대학마다 4월~11월로 다양'] },
          { n: 4, when: '7~11월', title: '인터뷰·합격', items: ['MMI·패널 인터뷰', '이듬해 1~2월 개강'] }
        ],
        head: ['대학', '시험 기준 (국제)', 'GPA', '인터뷰', '마감 (2027학년도)', '연 학비 AUD'],
        rows: [
          ['멜버른 MD', 'GAMSAT 각 50 또는 MCAT 492 (해외 거주자)', '5.0 (최근 3년 1:2:2)', '녹화형 온라인 MMI 8 (각 5분)', '6월 15일', '122,976 (2026) · 국제 60명'],
          ['멜버른 DDS (치대)', 'GAMSAT·DAT·BMAT 중 택1', 'WAM, 선수 해부·생리·생화학', '없음', '6월 15일 (2027 국제 안내서)', '112,000 (2026)'],
          ['시드니 MD', 'GAMSAT 각 50 또는 MCAT 500', '5.0', '일부 지원자', '6월 18일 · 1차 오퍼 10월 1일', '100,500 (대학 예상)'],
          ['시드니 DMD (치대)', 'GAMSAT (2027 일정 기준)', '5.0', '일반 요건 아님', '6월 18일 · 1차 오퍼 10월 8일', '98,500 (대학 예상)'],
          ['UQ MD', 'MCAT 504 (국제학생)', '5.0', 'MMI', '6월 8일 · 8월 14일', '109,328 (2027)'],
          ['ANU MChD', 'GAMSAT 50 또는 MCAT 영역별 125', '5.0 (마지막 해 3배)', 'Zoom', '6월 30일', '99,650 (2026) · 최대 30명'],
          ['맥쿼리 MD', 'GAMSAT 50 또는 MCAT 500', '5.0', 'Zoom MMI 4스테이션', '10월 1일', '상담 때 최신 금액 안내 · 국제 약 20명'],
          ['노트르담 MD', 'GAMSAT 50 또는 MCAT 500', '5.2', '온라인 패널', '11월 30일 (수시)', '81,000 (2027)'],
          ['울런공 MD', 'GAMSAT 50 또는 MCAT 495 + Casper', '5.5', '온라인 MMI 8', '8월 31일', '세션당 40,992 (2026) · 15명'],
          ['디킨 MD', 'GAMSAT 또는 MCAT 영역별 125', '5.0', '온라인 인터뷰 (국제 형식은 대학 공지 후 반영)', '4·7·9월 3회', '약 94,600, 장학금 다수 · 15명'],
          ['플린더스 MD', 'GAMSAT 각 50 또는 MCAT 496', '5.0', '국제 안내에 인터뷰 언급 없음 (GPA로 순위 가능)', '수시', '91,200 (2026)'],
          ['그리피스 MD', 'GAMSAT 각 50 또는 MCAT 123', '5.0', '있음', '대학 공지 후 반영', '88,500 (2027) · 최대 35명'],
          ['UWA MD · DMD', 'GAMSAT 55 (각 50) 또는 MCAT 500, DMD는 DAT도', '5.5', '2인 패널 50분', '4월 30일 · 6월 30일', 'MD 92,900 / DMD 93,700 (2026)'],
          ['모나쉬 Graduate MD', '시험 없음', '6.0', '온라인 MMI 4', '6월 30일 · 인터뷰 7월 28~29일', '상담 때 최신 금액 안내 · 약 30명']
        ],
        notes: [
          'GAMSAT은 한국에 시험장이 없습니다(2026년 해외 시험장: 영국·아일랜드·뉴질랜드·싱가포르). 해외 응시 또는 원격 응시 승인이 필요합니다. 응시료 AUD 568.',
          '해외 거주 국제학생은 MCAT으로 지원할 수 있는 대학이 많습니다. UQ는 국제학생에게 MCAT만 받습니다.',
          '2028학년도 지원이라면 GAMSAT은 2027년 3월, MCAT은 2027년 중반까지 응시해야 대부분의 마감에 맞출 수 있습니다.'
        ]
      },
      vet: {
        label: '수의대', badge: 'TRACK 5 · 수의대', title: '호주 수의대, 고교 직행과 대학원 두 갈래',
        lead: '국제학생이 갈 수 있는 호주 수의대는 7개 대학 8개 과정입니다. 고교 졸업 후 바로 들어가는 5~6년제(UQ·제임스쿡·머독·애들레이드·찰스스터트·시드니 통합과정)와, 학사 졸업 후 들어가는 4년제 DVM(시드니·멜버른)으로 나뉩니다. 의대와 달리 ISAT·UCAT은 보지 않고 Casper 같은 상황판단 검사를 많이 봅니다.',
        who: ['동물·수의 분야에 관심이 확실한 고3·졸업생', '화학·수학·생물 성적이 좋은 학생', '이공계 학사 졸업(예정)자 — 시드니·멜버른 DVM'],
        conds: [
          { n: '01', title: '고교 성적', items: ['수능 기준 공개는 애들레이드(350) 한 곳뿐', 'UQ 2026 최저 합격 ATAR 98 · IB 41.75', '제임스쿡 ATAR 94 · IB 38 · SAT 1360', '머독 ATAR 94 초과 · IB 36'] },
          { n: '02', title: '선수과목', items: ['화학·수학은 대부분 필수 또는 강력 권장', '생물 또는 물리 (UQ)', 'DVM은 대학 화학·생물·생화학 이수'] },
          { n: '03', title: '영어', items: ['대부분 IELTS 7.0, 모든 영역 7', '멜버른 DVM은 쓰기 7 · 나머지 6', '수의학은 의대보다 영어 기준이 높은 편'] },
          { n: '04', title: '선발', items: ['Casper 필수 대학 다수 (UQ는 40% 반영)', '인터뷰: 머독 녹화형(50%) · 제임스쿡 Kira · 찰스스터트 Zoom', '시드니 DVM은 Kira + Casper, 멜버른 DVM은 서류·Casper'] }
        ],
        steps: [
          { n: 1, when: '고1~고2', title: '선수과목·동물 경험', items: ['화학·수학·생물 이수', '동물병원·농장 등 경험 기록 (일부 대학 증빙 요구)'] },
          { n: 2, when: '고3 상반기', title: '영어·Casper', items: ['IELTS 7.0 전 영역 7 확보', 'Casper 응시 일정 확인 (대학별 지정일)'] },
          { n: 3, when: '고3 6~9월', title: '원서 접수', items: ['제임스쿡 6월 30일 · 시드니 DVM 9월 15일', 'UQ·애들레이드 9월 30일 (2027학년도)'] },
          { n: 4, when: '9월~이듬해 1월', title: '인터뷰·오퍼·입학', items: ['머독·제임스쿡·찰스스터트 인터뷰', '오퍼 후 학생비자, 2~3월 개강'] }
        ],
        head: ['대학', '과정 · 기간', '학력 기준', '영어', '선발', '연 학비 AUD'],
        rows: [
          ['퀸즐랜드 UQ', 'BVSc(Hons) · 5년 · 고교 직행', '2026 최저 합격 ATAR 98 / IB 41.75', 'IELTS 7.0 (전 영역 7)', 'ATAR 60% + Casper 40% · 인터뷰 없음', '89,712 (2027)'],
          ['제임스쿡 JCU', 'BVSc(Hons) · 5년 · 고교 직행', 'ATAR 94 / IB 38 / SAT 1360', 'IELTS 7.0 (전 영역 7)', '서면 지원서 + Casper + Kira 녹화 인터뷰 · 국제 약 5명', '73,839 (2026)'],
          ['머독 Murdoch', 'BSc + DVM · 5년 · 고교 직행', 'ATAR 94 초과 / IB 36 / A-level 14', '상향 기준 (대학 확인)', 'Casper + 녹화 인터뷰 50%', '71,880 (2027)'],
          ['애들레이드', 'BSc(Vet Bioscience) 3년 → DVM 3년', '수능 350 / IB 33 / SAT 1280', 'IELTS 7.0 (전 영역 7)', '설문지 + Casper · 인터뷰 없음', '61,700 (BSc 단계)'],
          ['시드니 통합과정', 'BVetBiol/DVM · 6년 · 고교 직행', '대학별 개별 심사 · 상담 때 안내', '상담 때 안내', '상담 때 안내', '69,200 (대학 예상)'],
          ['찰스스터트 CSU', 'BVetBiol/BVetSc · 6년', 'ATAR 90 (2026 국제 안내)', 'IELTS 7.0 (전 영역 7)', 'Casper + Zoom 인터뷰 · 2027 국제 모집 여부는 대학 공지 후 반영', '상담 때 최신 금액 안내'],
          ['시드니 DVM', '4년 · 학사 졸업자', '학사 GPA credit(65점) 이상', 'IELTS 7.0 (전 영역 7)', 'Kira + Casper + Personal Statement', '84,000 (대학 예상)'],
          ['멜버른 DVM', '4년 · 이공계 학사 졸업자', 'WAM 75% 정도면 경쟁력 (대학 FAQ)', 'IELTS 7.0 (쓰기 7, 나머지 6)', '성적 + Personal Statement + Casper', '89,408 (2027)']
        ],
        notes: [
          '한국 수의사 면허: 의사·치과의사와 달리 예비시험이 없습니다. 인정 기준(AVMA·EAEVE·RCVS 인증 또는 5년제·160학점 이상)에 맞는 외국 수의대를 졸업하고 호주 수의사 면허를 받으면 국가시험에 응시합니다. 최근 4년 외국대학 출신 합격률은 58.8%(34명 중 20명)입니다.',
          '인증 기관이 대학마다 다릅니다. 멜버른·UQ·머독은 AVBC·AVMA·RCVS, 애들레이드는 AVBC·RCVS, 시드니는 AVBC·AVMA, 제임스쿡·찰스스터트는 공식 페이지에 AVBC만 표시되어 있어 한국 면허 기준 충족 여부를 따로 확인합니다.',
          '서던크로스대 수의대는 국제학생을 받지 않아 제외했습니다. 찰스스터트의 2027학년도 국제 모집 여부는 제가 대학에 직접 확인해 안내합니다.'
        ]
      }
    };
    var tabKeys = ['direct', 'foundation', 'bachelor', 'grad', 'vet', 'docs', 'time'];
    var tabLabels = { direct: '고교 직행', foundation: '파운데이션', bachelor: '학부 경유', grad: '의전원', vet: '수의대', docs: '지원 서류', time: '2028 일정' };
    var tabs = tabKeys.map(function (k) { return { label: tabLabels[k], on: S.tab === k, off: S.tab !== k, pick: function () { self.setState({ tab: k }); } }; });
    var p = P[S.tab] || P.direct;
    p = Object.assign({}, p, { steps: p.steps.map(function (s, i) { return Object.assign({}, s, { box: BOX[i % 4] }); }) });
    var engCol = (p.head || []).indexOf('영어');
    p.rows = (p.rows || []).map(function (r) { return r.map(function (v, ci) { return { v: v, st: ci === engCol ? 'white-space: nowrap' : '' }; }); });
    var docs = [
      { who: '고교 재학생', items: ['여권 사본', '영문 재학증명서', '영문 성적증명서 (최근 학기까지)', '수능 성적표 (응시 후 제출)', '영어 성적표 (IELTS·TOEFL·PTE, 2년 이내)', 'ISAT 또는 UCAT ANZ 성적', 'Personal Statement (UNSW 등 필수 대학)', '추천·지지서 (제임스쿡 의대 필수)'] },
      { who: '고교 졸업생', items: ['여권 사본', '영문 졸업증명서', '영문 고교 성적증명서', '수능 성적표', '영어 성적표', 'ISAT 또는 UCAT ANZ 성적', '공백기 활동 증빙', '군 복무자는 병적증명서 (모나쉬 2년 규정 예외 확인용)'] },
      { who: '대학 재학·졸업생 (의전원)', items: ['여권 사본', '대학 영문 성적·졸업(예정)증명서', '고교 영문 성적증명서 (일부 대학)', 'GAMSAT 또는 MCAT 성적', '영어 성적표', 'CV·경력·봉사 증빙', '울런공 지원 시 Casper 결과', '치대 지원 시 선수과목 이수 증빙'] }
    ];
    var timeline = [
      { when: '2026년 10월 26일 ~ 11월 6일', what: 'ISAT 2026년 4차 응시 기간', who: '2028학년도 직행 지원자 중 조기 응시 희망자 (재응시는 12개월 후)' },
      { when: '2027년 1월', what: 'ISAT 1차 (예상) · UWA 원서 접수 시작', who: '직행·파운데이션 지원자' },
      { when: '2027년 3월', what: 'GAMSAT 3월 시험 · UCAT ANZ 등록 시작 (예상)', who: '의전원 / UCAT형 대학 지원자' },
      { when: '2027년 4~5월', what: 'ISAT 2차 (예상) · UCAT 등록 마감 5월 중순', who: '모나쉬 지원자는 5월 초까지 ISAT 응시 필요 (2027학년도 기준)' },
      { when: '2027년 6월 20~30일', what: '커틴·모나쉬·UWA·애들레이드·제임스쿡 원서 마감', who: '직행 핵심 마감' },
      { when: '2027년 7~8월', what: 'UCAT ANZ 시험 · ISAT 3차 · 모나쉬·UWA 인터뷰', who: '직행 지원자' },
      { when: '2027년 9월', what: '뉴캐슬 JMP (9월 초) · UQ (9월 30일) 마감', who: 'UCAT형 지원자' },
      { when: '2027년 11월', what: '수능 · UNSW 원서 마감 (11월 30일)', who: 'UNSW 인터뷰는 6월~1월 매월' },
      { when: '2027년 12월 ~ 2028년 1월', what: '오퍼 수락 · 학생비자 신청 · 숙소', who: '합격자' },
      { when: '2028년 2월', what: '호주 의대·치대 개강', who: '' }
    ];
    return {
      tabs: tabs, p: p, docs: docs, timeline: timeline,
      isPath: !!P[S.tab], isDocs: S.tab === 'docs', isTime: S.tab === 'time'
    };
  }
}

Component.prototype.__tpl = function (v: any) {
  return (<><style dangerouslySetInnerHTML={{ __html: "html,body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}\nh1,h2,h3,h4{letter-spacing:-0.035em;line-height:1.28;text-wrap:balance}\n@media (max-width:640px){nav[aria-label=\"주요 메뉴\"]{flex-wrap:nowrap!important;overflow-x:auto;white-space:nowrap;max-width:100%;scrollbar-width:none}}\np,li,td,th,dd,dt,span,a,button,input{letter-spacing:-0.012em}\nstrong{letter-spacing:-0.02em}\nbody{margin:0;background:#F7F8F6}\na{color:#0F6E5A}a:hover{color:#0A5546}\nbutton:focus-visible,a:focus-visible{outline:3px solid #9CCFC0;outline-offset:2px}" }} />
<div style={{"fontFamily": "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif", "color": "#0B1F3A", "background": "#F7F8F6", "width": "100%", "fontSize": "16px", "lineHeight": "1.75", "wordBreak": "keep-all", "overflowWrap": "break-word"}}>{" "}<header style={{"background": "#FFFFFF", "borderBottom": "1px solid #DDE2E0"}}>{" "}<div style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "14px 24px", "display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "12px 28px"}}>{" "}<a href={"/medical"} style={{"display": "flex", "alignItems": "center", "gap": "10px", "textDecoration": "none", "color": "#0B1F3A", "marginRight": "auto"}}>{" "}<svg width={"34"} height={"34"} viewBox={"0 0 34 34"} aria-hidden={"true"}><rect width={"34"} height={"34"} rx={"9"} fill={"#0B1F3A"}></rect><path d={"M17 8v18M8 17h18"} stroke={"#E0A526"} strokeWidth={"3"} strokeLinecap={"round"}></path></svg>{" "}<span style={{"display": "flex", "flexDirection": "column", "lineHeight": "1.2"}}><span style={{"fontWeight": "800", "fontSize": "19px"}}>{"호주유학 메디컬"}</span><span style={{"fontSize": "11px", "color": "#5B6676", "letterSpacing": "0.06em"}}>{"MEDICINE · DENTISTRY · VET"}</span></span>{" "}</a>{" "}<nav aria-label={"주요 메뉴"} style={{"display": "flex", "flexWrap": "wrap", "gap": "4px 22px", "fontSize": "15px", "fontWeight": "500"}}>{" "}<a href={"/"} style={{"color": "#5B6676", "textDecoration": "none", "padding": "10px 0", "fontSize": "14px"}}>{"호주유학 홈"}</a>{" "}<a href={"/medical/admission"} style={{"color": "#0F6E5A", "fontWeight": "700", "textDecoration": "none", "padding": "10px 0"}}>{"입학 안내"}</a>{" "}<a href={"/medical/universities"} style={{"color": "#0B1F3A", "textDecoration": "none", "padding": "10px 0"}}>{"대학 정보"}</a>{" "}<a href={"/medical/ib-sat"} style={{"color": "#0B1F3A", "textDecoration": "none", "padding": "10px 0"}}>{"IB·SAT"}</a>{" "}<a href={"/medical/scores"} style={{"color": "#0B1F3A", "textDecoration": "none", "padding": "10px 0"}}>{"합격선"}</a>{" "}<a href={"/medical/calendar"} style={{"color": "#0B1F3A", "textDecoration": "none", "padding": "10px 0"}}>{"입시 일정"}</a>{" "}<a href={"/medical/mmi"} style={{"color": "#0B1F3A", "textDecoration": "none", "padding": "10px 0"}}>{"인터뷰"}</a>{" "}<a href={"/medical/services"} style={{"color": "#0B1F3A", "textDecoration": "none", "padding": "10px 0"}}>{"서비스·비용"}</a>{" "}</nav>{" "}<a href={"/medical#consult"} style={{"display": "inline-flex", "alignItems": "center", "minHeight": "44px", "padding": "0 20px", "borderRadius": "10px", "background": "#C8432F", "color": "#FFFFFF", "textDecoration": "none", "fontWeight": "700", "fontSize": "15px"}}>{"상담 예약"}</a>{" "}</div>{" "}</header>{" "}<section style={{"position": "relative", "background": "#0B1F3A", "color": "#FFFFFF", "overflow": "hidden"}}>{" "}<img src={"/assets/26c721dc19a9072b175762b4d9df007f.jpg"} alt={""} aria-hidden={"true"} style={{"position": "absolute", "inset": "0", "width": "100%", "height": "100%", "objectFit": "cover", "opacity": "0.35"}} />{" "}<div style={{"position": "relative", "maxWidth": "1200px", "margin": "0 auto", "padding": "72px 24px 64px", "display": "flex", "flexDirection": "column", "gap": "16px"}}>{" "}<p style={{"margin": "0", "fontSize": "14px", "color": "#C9D3DE"}}>{"홈 › 입학 안내"}</p>{" "}<h1 style={{"margin": "0", "fontSize": "clamp(32px, 5vw, 52px)", "fontWeight": "800", "lineHeight": "1.2"}}>{"호주 의대·치대·수의대 입학 경로"}</h1>{" "}<p style={{"margin": "0", "fontSize": "18px", "color": "#E4EAF1", "maxWidth": "680px"}}>{"지금 학년과 학력에 따라 갈 수 있는 길이 다릅니다. 경로를 고르면 필요한 시험, 성적 기준, 지원 가능한 대학, 마감일까지 한 번에 보입니다."}</p>{" "}<p style={{"margin": "0", "fontSize": "14px", "color": "#E0A526"}}>{"모든 수치는 각 대학의 2027학년도 공식 자료 기준입니다. 2028학년도 요강은 2027년 3~4월부터 발표되며 확인되는 대로 반영합니다."}</p>{" "}</div>{" "}</section>{" "}<nav aria-label={"입학 경로"} style={{"position": "sticky", "top": "0", "zIndex": "5", "background": "#FFFFFF", "borderBottom": "1px solid #DDE2E0"}}>{" "}<div role={"tablist"} style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "0 16px", "display": "flex", "gap": "4px", "overflowX": "auto"}}>{" "}{(v?.tabs || []).map((t: any, __i0: number) => (<Fragment key={__i0}>{" "}{t?.on ? (<><button type={"button"} role={"tab"} aria-selected={"true"} onClick={t?.pick} style={{"flex": "none", "minHeight": "56px", "padding": "0 18px", "border": "0", "borderBottom": "3px solid #0F6E5A", "background": "transparent", "color": "#0F6E5A", "font": "inherit", "fontWeight": "700", "fontSize": "16px", "cursor": "pointer"}}>{t?.label}</button></>) : null}{" "}{t?.off ? (<><button type={"button"} role={"tab"} aria-selected={"false"} onClick={t?.pick} style={{"flex": "none", "minHeight": "56px", "padding": "0 18px", "border": "0", "borderBottom": "3px solid transparent", "background": "transparent", "color": "#2B3A4F", "font": "inherit", "fontWeight": "500", "fontSize": "16px", "cursor": "pointer"}}>{t?.label}</button></>) : null}{" "}</Fragment>))}{" "}</div>{" "}</nav>{" "}{v?.isPath ? (<>{" "}<section style={{"padding": "72px 24px 32px"}}>{" "}<div style={{"maxWidth": "1200px", "margin": "0 auto", "display": "flex", "flexWrap": "wrap", "gap": "48px", "alignItems": "center"}}>{" "}<div style={{"flex": "1 1 520px", "minWidth": "0", "display": "flex", "flexDirection": "column", "gap": "16px"}}>{" "}<span style={{"alignSelf": "flex-start", "padding": "6px 14px", "borderRadius": "999px", "background": "#FBEDEA", "color": "#A8331F", "fontSize": "14px", "fontWeight": "700"}}>{v?.p?.badge}</span>{" "}<h2 style={{"margin": "0", "fontSize": "clamp(28px, 4vw, 40px)", "fontWeight": "800", "lineHeight": "1.25"}}>{v?.p?.title}</h2>{" "}<p style={{"margin": "0", "fontSize": "17px", "color": "#2B3A4F"}}>{v?.p?.lead}</p>{" "}</div>{" "}<div style={{"flex": "1 1 380px", "minWidth": "0", "background": "#FFFFFF", "borderRadius": "14px", "padding": "28px", "border": "1px solid #DDE2E0", "boxSizing": "border-box"}}>{" "}<strong style={{"display": "block", "fontSize": "17px", "marginBottom": "10px"}}>{"이런 학생에게 맞습니다"}</strong>{" "}<ul style={{"margin": "0", "paddingLeft": "20px", "display": "flex", "flexDirection": "column", "gap": "6px", "color": "#2B3A4F"}}>{(v?.p?.who || []).map((w: any, __i0: number) => (<Fragment key={__i0}><li >{w}</li></Fragment>))}</ul>{" "}</div>{" "}</div>{" "}</section>{" "}<section style={{"padding": "32px 24px"}}>{" "}<div style={{"maxWidth": "1200px", "margin": "0 auto", "display": "flex", "flexDirection": "column", "gap": "28px"}}>{" "}<h3 style={{"margin": "0", "fontSize": "28px", "fontWeight": "800"}}>{"합격 조건"}</h3>{" "}<div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(250px, 1fr))", "gap": "16px"}}>{" "}{(v?.p?.conds || []).map((c: any, __i0: number) => (<Fragment key={__i0}>{" "}<div style={{"background": "#FFFFFF", "borderRadius": "14px", "padding": "26px", "border": "1px solid #DDE2E0", "display": "flex", "flexDirection": "column", "gap": "10px"}}>{" "}<span style={{"alignSelf": "flex-start", "padding": "3px 12px", "borderRadius": "999px", "background": "#0B1F3A", "color": "#FFFFFF", "fontSize": "13px", "fontWeight": "700"}}>{c?.n}</span>{" "}<strong style={{"fontSize": "20px", "fontWeight": "800"}}>{c?.title}</strong>{" "}<ul style={{"margin": "0", "paddingLeft": "18px", "fontSize": "15px", "color": "#2B3A4F", "display": "flex", "flexDirection": "column", "gap": "4px"}}>{(c?.items || []).map((it: any, __i2: number) => (<Fragment key={__i2}><li >{it}</li></Fragment>))}</ul>{" "}</div>{" "}</Fragment>))}{" "}</div>{" "}</div>{" "}</section>{" "}<section style={{"padding": "32px 24px"}}>{" "}<div style={{"maxWidth": "1200px", "margin": "0 auto", "display": "flex", "flexDirection": "column", "gap": "28px"}}>{" "}<h3 style={{"margin": "0", "fontSize": "28px", "fontWeight": "800"}}>{"진행 과정"}</h3>{" "}<div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(250px, 1fr))", "gap": "16px"}}>{" "}{(v?.p?.steps || []).map((s: any, __i0: number) => (<Fragment key={__i0}>{" "}<div style={css(s?.box)}>{" "}<div style={{"display": "flex", "justifyContent": "space-between", "borderBottom": "1px solid rgba(255,255,255,0.5)", "paddingBottom": "10px", "fontSize": "14px", "fontWeight": "700"}}><span >{"STEP "}{s?.n}</span><span >{s?.when}</span></div>{" "}<strong style={{"fontSize": "21px", "fontWeight": "800", "lineHeight": "1.35"}}>{s?.title}</strong>{" "}<ul style={{"margin": "0", "paddingLeft": "18px", "fontSize": "15px", "display": "flex", "flexDirection": "column", "gap": "4px"}}>{(s?.items || []).map((it: any, __i2: number) => (<Fragment key={__i2}><li >{it}</li></Fragment>))}</ul>{" "}</div>{" "}</Fragment>))}{" "}</div>{" "}</div>{" "}</section>{" "}</>) : null}{" "}{v?.isDocs ? (<>{" "}<section style={{"padding": "72px 24px"}}>{" "}<div style={{"maxWidth": "1200px", "margin": "0 auto", "display": "flex", "flexDirection": "column", "gap": "28px"}}>{" "}<h2 style={{"margin": "0", "fontSize": "clamp(28px, 4vw, 40px)", "fontWeight": "800", "lineHeight": "1.25"}}>{"지원 서류 (학력별)"}</h2>{" "}<p style={{"margin": "0", "color": "#2B3A4F", "maxWidth": "760px"}}>{"대학마다 요구 서류가 조금씩 다릅니다. 아래는 공통으로 준비하는 서류이고, 원서 준비를 맡기시면 대학별 체크리스트를 따로 만들어 드립니다."}</p>{" "}<div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(300px, 1fr))", "gap": "16px"}}>{" "}{(v?.docs || []).map((d: any, __i0: number) => (<Fragment key={__i0}>{" "}<div style={{"background": "#FFFFFF", "borderRadius": "14px", "border": "1px solid #DDE2E0", "padding": "28px", "display": "flex", "flexDirection": "column", "gap": "12px"}}>{" "}<strong style={{"fontSize": "21px", "fontWeight": "800"}}>{d?.who}</strong>{" "}<ul style={{"margin": "0", "paddingLeft": "20px", "color": "#2B3A4F", "display": "flex", "flexDirection": "column", "gap": "6px", "fontSize": "15px"}}>{(d?.items || []).map((it: any, __i2: number) => (<Fragment key={__i2}><li >{it}</li></Fragment>))}</ul>{" "}</div>{" "}</Fragment>))}{" "}</div>{" "}</div>{" "}</section>{" "}</>) : null}{" "}{v?.isTime ? (<>{" "}<section style={{"padding": "72px 24px"}}>{" "}<div style={{"maxWidth": "1000px", "margin": "0 auto", "display": "flex", "flexDirection": "column", "gap": "28px"}}>{" "}<h2 style={{"margin": "0", "fontSize": "clamp(28px, 4vw, 40px)", "fontWeight": "800", "lineHeight": "1.25"}}>{"2028년 2월 입학 예상 일정"}</h2>{" "}<p style={{"margin": "0", "color": "#2B3A4F"}}>{"2027학년도 실제 일정을 바탕으로 한 1년 뒤 예상 일정입니다. 공식 발표 즉시 갱신합니다."}</p>{" "}<ol style={{"margin": "0", "padding": "0", "listStyle": "none", "borderLeft": "3px solid #0F6E5A", "display": "flex", "flexDirection": "column", "gap": "22px"}}>{(v?.timeline || []).map((tl: any, __i0: number) => (<Fragment key={__i0}><li style={{"position": "relative", "paddingLeft": "28px"}}>{" "}<span aria-hidden={"true"} style={{"position": "absolute", "left": "-10px", "top": "6px", "width": "17px", "height": "17px", "borderRadius": "50%", "background": "#FFFFFF", "border": "3px solid #0F6E5A", "boxSizing": "border-box"}}></span>{" "}<span style={{"display": "block", "fontWeight": "800", "color": "#0F6E5A"}}>{tl?.when}</span>{" "}<strong style={{"display": "block", "fontSize": "18px"}}>{tl?.what}</strong>{" "}<span style={{"display": "block", "color": "#5B6676", "fontSize": "15px"}}>{tl?.who}</span>{" "}</li></Fragment>))}</ol>{" "}</div>{" "}</section>{" "}</>) : null}{" "}{v?.isPath ? (<>{" "}<section style={{"padding": "32px 24px 72px"}}>{" "}<div style={{"maxWidth": "1200px", "margin": "0 auto", "display": "flex", "flexDirection": "column", "gap": "20px"}}>{" "}<div style={{"display": "flex", "flexWrap": "wrap", "justifyContent": "space-between", "alignItems": "flex-end", "gap": "12px"}}>{" "}<h3 style={{"margin": "0", "fontSize": "28px", "fontWeight": "800"}}>{"이 경로로 지원할 수 있는 대학"}</h3>{" "}<a href={"/medical/universities"} style={{"fontWeight": "700"}}>{"대학별 상세 정보 보기 →"}</a>{" "}</div>{" "}<div style={{"overflowX": "auto", "background": "#FFFFFF", "borderRadius": "14px", "border": "1px solid #DDE2E0"}}>{" "}<table style={{"width": "100%", "minWidth": "900px", "borderCollapse": "collapse", "fontSize": "15px"}}><thead ><tr style={{"background": "#0B1F3A", "color": "#FFFFFF", "textAlign": "left"}}>{(v?.p?.head || []).map((h: any, __i0: number) => (<Fragment key={__i0}><th scope={"col"} style={{"padding": "14px 16px", "fontWeight": "700", "whiteSpace": "nowrap"}}>{h}</th></Fragment>))}</tr></thead><tbody >{(v?.p?.rows || []).map((r: any, __i0: number) => (<Fragment key={__i0}><tr style={{"borderTop": "1px solid #DDE2E0", "verticalAlign": "top"}}>{(r || []).map((cell: any, __i2: number) => (<Fragment key={__i2}><td style={css(`padding: 14px 16px; color: #2B3A4F; ${cell?.st ?? ''}`)}>{cell?.v}</td></Fragment>))}</tr></Fragment>))}</tbody></table>{" "}</div>{" "}<div style={{"background": "#E9EEF5", "borderRadius": "14px", "padding": "22px 24px", "display": "flex", "flexDirection": "column", "gap": "8px"}}>{" "}<strong >{"꼭 알아둘 점"}</strong>{" "}<ul style={{"margin": "0", "paddingLeft": "20px", "color": "#2B3A4F", "display": "flex", "flexDirection": "column", "gap": "6px", "fontSize": "15px"}}>{(v?.p?.notes || []).map((nt: any, __i0: number) => (<Fragment key={__i0}><li >{nt}</li></Fragment>))}</ul>{" "}</div>{" "}</div>{" "}</section>{" "}</>) : null}{" "}<footer style={{"background": "#071629", "color": "#A9B6C4", "padding": "48px 24px calc(48px + 76px)"}}>{" "}<div style={{"maxWidth": "1200px", "margin": "0 auto", "display": "flex", "flexDirection": "column", "gap": "8px", "fontSize": "14px"}}>{" "}<strong style={{"color": "#FFFFFF", "fontSize": "17px"}}>{"호주유학 메디컬"}</strong>{" "}<span >{"상호 AusUhak(호주유학) · 대표 김구복 · 사업자등록번호 884-25-02296 · 서울특별시 강남구 테헤란로6길 26, 3층 318호 · 010-9848-7789 · 대면 상담 서울특별시 강남구 역삼로 521 대종빌딩 3층"}</span>{" "}<span >{"대학 입학 요건은 각 대학 공식 자료를 근거로 정리했으며, 최종 기준은 대학 발표를 따릅니다."}</span>{" "}</div>{" "}</footer>{" "}<div style={{"position": "fixed", "left": "0", "right": "0", "bottom": "0", "zIndex": "10", "background": "#0B1F3A", "color": "#FFFFFF"}}>{" "}<div style={{"maxWidth": "1200px", "margin": "0 auto", "padding": "12px 24px", "display": "flex", "flexWrap": "wrap", "gap": "10px 20px", "alignItems": "center", "justifyContent": "space-between"}}>{" "}<span style={{"fontSize": "15px"}}>{"내 성적으로 어느 경로가 맞는지, 호주 대학 교직원 출신 전문가가 직접 봐 드립니다."}</span>{" "}<span style={{"display": "flex", "gap": "8px"}}>{" "}<a href={"/medical#diagnose"} style={{"display": "inline-flex", "alignItems": "center", "minHeight": "44px", "padding": "0 16px", "borderRadius": "10px", "border": "1px solid rgba(255,255,255,0.6)", "color": "#FFFFFF", "textDecoration": "none", "fontWeight": "700", "fontSize": "14px"}}>{"입학 경로 찾기"}</a>{" "}<a href={"/medical#consult"} style={{"display": "inline-flex", "alignItems": "center", "minHeight": "44px", "padding": "0 18px", "borderRadius": "10px", "background": "#C8432F", "color": "#FFFFFF", "textDecoration": "none", "fontWeight": "700", "fontSize": "14px"}}>{"상담 예약"}</a>{" "}</span>{" "}</div>{" "}</div>{" "}</div></>);
};

export default Component;
