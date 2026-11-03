"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import {
  completeAction,
  joinFamilyAction,
  kakaoAction,
  loginAction,
  resetAction,
  signupAction,
  updatePasswordAction,
  type FormState,
} from "@/app/login/actions";

function Msg({ s }: { s: FormState }) {
  if (!s) return null;
  if (s.error) return <p className="au-err" role="alert">{s.error}</p>;
  if (s.info) return <p className="au-info" role="status">{s.info}</p>;
  return null;
}

function Kakao({ next }: { next?: string }) {
  return (
    <form action={kakaoAction}>
      <input type="hidden" name="next" value={next || ""} />
      <button type="submit" className="au-btn au-kakao">카카오로 시작하기</button>
    </form>
  );
}

export function LoginForm({ next, error }: { next?: string; error?: string }) {
  const [s, act, pending] = useActionState(loginAction, error ? { error } : undefined);
  return (
    <>
      <h2 style={{ margin: 0, fontSize: 24 }}>로그인</h2>
      <Kakao next={next} />
      <span className="au-or">또는 이메일</span>
      <form className="au-form" action={act}>
        <input type="hidden" name="next" value={next || ""} />
        <label>이메일<input type="email" name="email" autoComplete="email" required /></label>
        <label>비밀번호<input type="password" name="password" autoComplete="current-password" required /></label>
        <Msg s={s} />
        <button type="submit" className="au-btn" disabled={pending}>{pending ? "확인 중…" : "로그인"}</button>
      </form>
      <div className="au-row">
        <Link href="/login/reset">비밀번호를 잊었어요</Link>
        <Link href="/signup">처음이에요, 가입하기</Link>
      </div>
    </>
  );
}

function RoleFields({ withPassword }: { withPassword: boolean }) {
  const [role, setRole] = useState<"student" | "parent">("student");
  return (
    <>
      <fieldset className="au-fs">
        <legend>누구신가요?</legend>
        <div className="au-roles">
          <label><input type="radio" name="role" value="student" checked={role === "student"} onChange={() => setRole("student")} />학생</label>
          <label><input type="radio" name="role" value="parent" checked={role === "parent"} onChange={() => setRole("parent")} />학부모</label>
        </div>
      </fieldset>
      {role === "parent" ? (
        <label>
          학생과의 관계
          <select name="relation" defaultValue="어머니">
            <option>어머니</option>
            <option>아버지</option>
            <option>보호자</option>
          </select>
        </label>
      ) : null}
      <label>이름<input type="text" name="name" autoComplete="name" required /></label>
      <label>휴대폰 번호<input type="tel" name="phone" autoComplete="tel" placeholder="010-" /></label>
      {withPassword ? (
        <>
          <label>
            이메일<input type="email" name="email" autoComplete="email" required />
            <span className="au-hint">이 주소에서 보내 주신 서류는 자동으로 내 서류함에 들어갑니다.</span>
          </label>
          <label>
            비밀번호<input type="password" name="password" autoComplete="new-password" minLength={8} required />
            <span className="au-hint">8자 이상</span>
          </label>
        </>
      ) : null}
      <label>
        연결 코드{role === "parent" ? "" : " (받은 경우)"}
        <input type="text" name="code" autoComplete="off" placeholder="예: K7P3-M9QX" required={role === "parent"} style={{ textTransform: "uppercase" }} />
        <span className="au-hint">
          {role === "parent"
            ? "학생 마이페이지나 제가 보내 드린 메시지에 있는 8자리 코드입니다. 넣으시면 학생과 같은 마이페이지를 함께 봅니다."
            : "제가 보내 드린 코드가 있으면 넣어 주세요. 없으면 비워 두셔도 됩니다."}
        </span>
      </label>
      <label className="au-check">
        <input type="checkbox" name="agree" required />
        <span>
          [필수] 개인정보 수집·이용에 동의합니다. <Link href="/privacy" target="_blank">내용 보기</Link>
        </span>
      </label>
    </>
  );
}

export function SignupForm() {
  const [s, act, pending] = useActionState(signupAction, undefined);
  return (
    <>
      <Kakao />
      <span className="au-or">또는 이메일로 가입</span>
      <form className="au-form" action={act}>
        <h2>회원가입</h2>
        <RoleFields withPassword />
        <Msg s={s} />
        <button type="submit" className="au-btn" disabled={pending}>{pending ? "가입 중…" : "가입하기"}</button>
      </form>
    </>
  );
}

export function CompleteForm() {
  const [s, act, pending] = useActionState(completeAction, undefined);
  return (
    <form className="au-form" action={act}>
      <h2>가입 마무리</h2>
      <p className="au-note">처음 오셨네요. 아래만 채워 주시면 마이페이지가 열립니다.</p>
      <RoleFields withPassword={false} />
      <Msg s={s} />
      <button type="submit" className="au-btn" disabled={pending}>{pending ? "저장 중…" : "시작하기"}</button>
    </form>
  );
}

export function FamilyForm() {
  const [s, act, pending] = useActionState(joinFamilyAction, undefined);
  return (
    <form className="au-form" action={act}>
      <h2>가족 연결</h2>
      <p className="au-note">
        학생 마이페이지나 제가 보내 드린 메시지의 연결 코드 8자리를 넣으시면, 학생과 부모님이 같은 마이페이지를 함께 보게 됩니다. 먼저 로그인해 주세요.
      </p>
      <label>
        연결 코드
        <input type="text" name="code" autoComplete="off" placeholder="예: K7P3-M9QX" required style={{ textTransform: "uppercase" }} />
      </label>
      <p className="au-note" style={{ background: "#F5F7FA", borderRadius: 12, padding: 14 }}>
        연결되면 서류, 메시지, 진행 단계를 같이 보고, 각자 자기 이름으로 메시지를 남깁니다.
      </p>
      <Msg s={s} />
      <button type="submit" className="au-btn" disabled={pending}>{pending ? "연결 중…" : "연결하기"}</button>
    </form>
  );
}

export function ResetForm() {
  const [s, act, pending] = useActionState(resetAction, undefined);
  return (
    <form className="au-form" action={act}>
      <h2>비밀번호 찾기</h2>
      <p className="au-note">가입한 이메일로 비밀번호를 다시 정하는 링크를 보내 드립니다.</p>
      <label>이메일<input type="email" name="email" autoComplete="email" required /></label>
      <Msg s={s} />
      <button type="submit" className="au-btn" disabled={pending}>링크 받기</button>
      <Link href="/login" style={{ fontSize: 14 }}>로그인으로 돌아가기</Link>
    </form>
  );
}

export function UpdatePasswordForm() {
  const [s, act, pending] = useActionState(updatePasswordAction, undefined);
  return (
    <form className="au-form" action={act}>
      <h2>새 비밀번호</h2>
      <label>새 비밀번호<input type="password" name="password" autoComplete="new-password" minLength={8} required /><span className="au-hint">8자 이상</span></label>
      <Msg s={s} />
      <button type="submit" className="au-btn" disabled={pending}>저장</button>
    </form>
  );
}
