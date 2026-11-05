import AuthFrame from "@/components/auth/AuthFrame";
import { LoginForm } from "@/components/auth/forms";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "로그인 - AusUhak(호주유학)", description: "AusUhak 마이페이지 로그인", path: "/login", noindex: true });

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const error = sp.error ? "로그인이 되지 않았습니다. 다시 시도해 주세요." : undefined;
  return (
    <AuthFrame tab="login">
      <LoginForm next={sp.next} error={error} />
    </AuthFrame>
  );
}
