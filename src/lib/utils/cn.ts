import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind 클래스 병합 헬퍼 (shadcn/ui 표준 패턴).
// 동일 속성 충돌 시 뒤 클래스가 우선 (twMerge).
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
