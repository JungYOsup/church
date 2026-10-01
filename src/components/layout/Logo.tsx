import Link from "next/link";

function LogoMark() {
  return (
    <svg viewBox="0 0 52 40" className="h-9 w-12 shrink-0" aria-hidden="true">
      <path d="M2 36 L17 18 L30 36 Z" fill="#3B82F6" />
      <path d="M14 36 L31 14 L50 36 Z" fill="#22C55E" />
      <path d="M30 36 Q40 26 50 36 Z" fill="#F59E0B" />
      <rect x="29" y="1" width="3.5" height="20" rx="0.5" fill="#1E293B" />
      <rect x="23.5" y="6.5" width="14.5" height="3.5" rx="0.5" fill="#1E293B" />
      <rect x="1" y="36" width="50" height="2.5" rx="1.25" fill="#16A34A" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5">
      <LogoMark />
      <span className="flex flex-col leading-tight">
        <span className="text-lg font-bold tracking-tight text-foreground lg:text-xl">
          함께하는 교회
        </span>
        <span className="hidden text-xs text-muted-foreground sm:block">
          지역의 교회가 함께 세상을 아름답게
        </span>
      </span>
    </Link>
  );
}
