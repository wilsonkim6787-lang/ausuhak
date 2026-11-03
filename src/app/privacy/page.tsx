import SiteShell, { Crumbs } from "@/components/SiteShell";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMeta({
  title: "개인정보처리방침 - AusUhak(호주유학)",
  description: "AusUhak(호주유학)이 수집하는 개인정보 항목, 이용 목적, 보유 기간, 위탁, 정보주체의 권리를 안내합니다.",
  path: "/privacy",
});

const UPDATED = "2026년 11월 3일";

export default function PrivacyPage() {
  return (
    <SiteShell>
      <div className="ux-wrap" style={{ maxWidth: 820 }}>
        <Crumbs items={[{ name: "홈", path: "/" }, { name: "개인정보처리방침" }]} />
        <h1 className="ux-h1">개인정보처리방침</h1>
        <p className="ux-muted">시행일 {UPDATED}</p>
        <article className="ux-card ux-prose">
          <p>
            {SITE.name}(이하 &ldquo;회사&rdquo;)는 「개인정보 보호법」 등 관련 법령을 지키며, 이용자의 개인정보를 아래와 같이 처리합니다.
          </p>
          <h2>1. 수집하는 항목과 목적</h2>
          <ul>
            <li>상담 신청: 이름, 연락처(휴대전화·카카오톡·이메일), 학력, 영어 점수, 희망 전공과 시기, 상담 내용. 상담 응대와 진학 경로 안내에 씁니다.</li>
            <li>회원가입: 이름, 이메일, 비밀번호, 휴대전화, 가족 연결 정보(학생·학부모). 마이페이지 제공과 본인 확인에 씁니다.</li>
            <li>진학·비자 진행: 여권, 성적·졸업 증명, 영어 성적, 재정·재직 서류 등 학교 지원과 비자 신청에 필요한 서류. 학생이 맡긴 업무를 처리하는 데만 씁니다.</li>
            <li>자동 수집: 접속 기록, 기기·브라우저 정보, 쿠키. 서비스 안정성과 방문 통계에 씁니다.</li>
          </ul>
          <h2>2. 보유 기간</h2>
          <ul>
            <li>상담 신청 기록: 상담 종료 후 1년, 이후 파기합니다. 그 전에 삭제를 요청하시면 바로 파기합니다.</li>
            <li>회원 정보와 진행 서류: 회원 탈퇴 또는 진행 종료 후 3년. 법령상 보관 의무가 있는 기록은 그 기간 동안 보관합니다.</li>
            <li>계약·대금 기록: 5년(전자상거래법). 접속 기록: 3개월(통신비밀보호법).</li>
          </ul>
          <h2>3. 제3자 제공</h2>
          <p>
            회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 학교 지원이나 비자 신청을 맡기신 경우, 해당 업무에 필요한 범위에서 호주 교육기관과 호주 내무부(Department of Home Affairs)에 제출하며, 제출 전 항목과 대상을 안내합니다.
          </p>
          <h2>4. 처리 위탁과 국외 이전</h2>
          <ul>
            <li>Vercel Inc.(미국): 웹사이트 호스팅</li>
            <li>Supabase Inc.(미국): 회원·상담·서류 데이터 보관</li>
            <li>Google LLC(미국): 서류 수신용 이메일(Gmail)</li>
            <li>㈜카카오(대한민국): 카카오톡 채널 상담</li>
          </ul>
          <p>국외 이전은 서비스 이용 시점에 네트워크로 전송되며, 보유 기간은 위 2항과 같습니다.</p>
          <h2>5. 만 14세 미만 아동</h2>
          <p>만 14세 미만 학생의 개인정보는 법정대리인(부모님)의 동의를 받은 뒤에만 처리합니다. 조기유학 진행 시 동의서를 따로 받습니다.</p>
          <h2>6. 정보주체의 권리</h2>
          <p>
            이용자와 법정대리인은 언제든지 개인정보 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다. 카카오톡 채널이나 이메일로 요청하시면 지체 없이 처리합니다.
          </p>
          <h2>7. 파기 방법</h2>
          <p>보유 기간이 끝나거나 목적이 달성된 정보는 복구할 수 없는 방법으로 지체 없이 파기합니다.</p>
          <h2>8. 개인정보 보호책임자</h2>
          <ul>
            <li>성명: {SITE.owner}(Wilson Kim), 대표</li>
            <li>연락처: {SITE.phone}, {SITE.email}</li>
            <li>카카오톡 채널: {SITE.kakao}</li>
          </ul>
          <p>개인정보 침해 신고는 개인정보침해신고센터(privacy.kisa.or.kr, 국번 없이 118)에도 하실 수 있습니다.</p>
        </article>
      </div>
    </SiteShell>
  );
}
