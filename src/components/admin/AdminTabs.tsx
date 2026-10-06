import Link from "next/link";
import { cn } from "@/lib/utils";

export type AdminTab = "church" | "register";

const TABS: { key: AdminTab; label: string; href: string }[] = [
  { key: "church", label: "내 교회", href: "/admin" },
  { key: "register", label: "교회 등록·인증 신청", href: "/admin?tab=register" },
];

/**
 * 대표자 관리의 두 화면을 고르는 탭. 고른 화면은 주소(?tab=)에 두어
 * 홈의 "우리 교회 등록" 버튼이 신청 화면으로 바로 올 수 있게 한다.
 */
export function AdminTabs({ current }: { current: AdminTab }) {
  return (
    <nav aria-label="대표자 관리 메뉴" className="border-b">
      <ul role="list" className="-mb-px flex gap-1 overflow-x-auto">
        {TABS.map(({ key, label, href }) => (
          <li key={key} className="shrink-0">
            <Link
              href={href}
              scroll={false}
              aria-current={key === current ? "page" : undefined}
              className={cn(
                "inline-flex h-10 items-center rounded-t-md border-b-2 px-3 text-sm font-medium outline-hidden transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                key === current
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
