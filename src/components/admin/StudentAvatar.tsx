// 학생 식별 사진 — admin/mypage 공용.
// 사진 있으면 Supabase Storage public URL, 없으면 이름 이니셜 + 색상 fallback.

type Size = "sm" | "md" | "lg" | "xl";

const SIZE_CLASSES: Record<Size, string> = {
  sm: "size-7 text-[10px]",
  md: "size-10 text-xs",
  lg: "size-14 text-sm",
  xl: "size-20 text-lg",
};

const COLORS = [
  "bg-navy-900 text-gold-400",
  "bg-gold-500 text-white",
  "bg-error text-white",
  "bg-success text-white",
  "bg-navy-700 text-cream-100",
  "bg-gold-600 text-navy-900",
];

function colorFromName(name: string): string {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % COLORS.length;
  return COLORS[Math.abs(h) % COLORS.length];
}

function initial(name: string): string {
  const s = name.trim();
  if (!s) return "?";
  return s[0];
}

function publicUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/student-photos/${path}`;
}

export default function StudentAvatar({
  name,
  photoPath,
  size = "md",
  className = "",
}: {
  name: string | null;
  photoPath: string | null;
  size?: Size;
  className?: string;
}) {
  const display = name?.trim() || "?";
  const sizeClass = SIZE_CLASSES[size];

  if (photoPath) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={publicUrl(photoPath)}
        alt={display}
        className={`shrink-0 rounded-full bg-cream-200 object-cover ${sizeClass} ${className}`}
      />
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${colorFromName(display)} ${sizeClass} ${className}`}
      aria-label={display}
    >
      {initial(display)}
    </span>
  );
}
