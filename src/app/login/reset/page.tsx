import AuthFrame from "@/components/auth/AuthFrame";
import { ResetForm } from "@/components/auth/forms";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "비밀번호 찾기 - AusUhak(호주유학)", description: "비밀번호 찾기", path: "/login/reset", noindex: true });

export default function Page() {
  return <AuthFrame><ResetForm /></AuthFrame>;
}
