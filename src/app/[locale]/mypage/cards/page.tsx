// 옛 "카드 7장" 페이지 → /mypage 로 redirect (정보 부정확으로 폐기).

import { redirect } from "next/navigation";

export default async function MypageCardsRedirect() {
  redirect("/mypage");
}
