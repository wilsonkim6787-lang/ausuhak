import AuthFrame from "@/components/auth/AuthFrame";
import { SignupForm } from "@/components/auth/forms";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "회원가입 - AusUhak(호주유학)", description: "AusUhak 마이페이지 회원가입", path: "/signup", noindex: true });

export default function Page() {
  return <AuthFrame tab="signup"><SignupForm /></AuthFrame>;
}
