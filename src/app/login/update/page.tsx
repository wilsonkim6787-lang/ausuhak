import AuthFrame from "@/components/auth/AuthFrame";
import { UpdatePasswordForm } from "@/components/auth/forms";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "새 비밀번호 - AusUhak(호주유학)", description: "새 비밀번호", path: "/login/update", noindex: true });

export default function Page() {
  return <AuthFrame><UpdatePasswordForm /></AuthFrame>;
}
