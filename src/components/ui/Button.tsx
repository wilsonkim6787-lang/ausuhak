import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

// PART O 5-1 버튼 디자인 시스템 (사양서 PART_O.txt 5-1).
// 5 variants:
//   primary   = Gold 600 bg + White text   (메인 CTA / "+ 등록" / "💾 저장")
//   secondary = White bg + Navy 테두리      (보조 CTA / "취소" / "초기화")
//   strong    = Navy 900 bg + White text    (관리자 헤더 강조 / 어두운 배경 위)
//   ghost     = 투명 + Navy text             (텍스트 같은 버튼)
//   danger    = error bg + White text       (삭제 / 차단)
export const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 font-semibold transition " +
    "disabled:cursor-not-allowed disabled:opacity-60 " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600",
  {
    variants: {
      variant: {
        primary:
          "bg-gold-600 text-white shadow-sm hover:bg-gold-500 hover:shadow-md active:scale-[0.98]",
        secondary:
          "border border-navy-800 bg-white text-navy-800 hover:bg-cream-200",
        strong:
          "bg-navy-900 text-white hover:bg-navy-800 active:scale-[0.98]",
        ghost:
          "text-navy-700 hover:bg-cream-200",
        danger:
          "bg-error text-white hover:opacity-90 active:scale-[0.98]",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-7 py-3 text-base",
      },
      shape: {
        pill: "rounded-full",
        rounded: "rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      shape: "pill",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles>;

// <button> 전용. Link-Button이 필요하면 buttonStyles({...})를 직접 사용:
//   <Link className={buttonStyles({ variant: "primary" })} href="/x">Go</Link>
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonStyles({ variant, size, shape }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
