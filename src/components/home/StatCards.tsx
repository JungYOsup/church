import Link from "next/link";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Church,
  Users,
  type LucideIcon,
} from "lucide-react";
import { getStats } from "@/lib/data/stats";
import { cn } from "@/lib/utils";

interface StatCard {
  label: string;
  value: number;
  description: string;
  href: string;
  icon: LucideIcon;
  /**
   * globals.css의 통계 카드 토큰. 글자색은 카드에 한 번 주고 아이콘과 숫자가 물려받는다.
   * Tailwind는 소스를 글자 그대로 읽어 클래스를 찾으므로, 조립하지 않고 완성된 문자열로 적는다.
   */
  accentClassName: string;
  tileClassName: string;
}

export async function StatCards() {
  const stats = await getStats();

  const cards: StatCard[] = [
    {
      label: "등록 교회",
      value: stats.churchCount,
      description: `전국 ${stats.regionCount}개 지역의 교회가 함께하고 있습니다.`,
      href: "/map",
      icon: Church,
      accentClassName: "text-stat-blue",
      tileClassName: "bg-stat-blue-soft",
    },
    {
      label: "이번 주 행사",
      value: stats.weeklyEventCount,
      description: "이번 주에 진행되는 교회 행사입니다.",
      href: "/events",
      icon: CalendarDays,
      accentClassName: "text-stat-green",
      tileClassName: "bg-stat-green-soft",
    },
    {
      label: "공유 공지",
      value: stats.noticeCount,
      description: "교회들의 다양한 소식을 확인해보세요.",
      href: "/notices",
      icon: Bell,
      accentClassName: "text-stat-orange",
      tileClassName: "bg-stat-orange-soft",
    },
    {
      label: "대표자 인증",
      value: stats.verifiedRepresentativeCount,
      description: "공식 인증된 교회 대표자 수입니다.",
      href: "/admin",
      icon: Users,
      accentClassName: "text-stat-violet",
      tileClassName: "bg-stat-violet-soft",
    },
  ];

  return (
    <section aria-label="교회 연합 현황">
      {/* Tailwind preflight가 목록 스타일을 지우면 Safari VoiceOver가 목록으로 읽지 않아 role을 준다 */}
      <ul role="list" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {cards.map(({ label, value, description, href, icon: Icon, accentClassName, tileClassName }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "group relative flex h-full items-start gap-4 rounded-xl border bg-card p-5 shadow-sm transition-shadow outline-hidden hover:shadow-md focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                accentClassName,
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-14 shrink-0 items-center justify-center rounded-2xl",
                  tileClassName,
                )}
              >
                <Icon className="size-7" />
              </span>
              <div className="min-w-0 flex-1 break-keep">
                <p className="pr-6 text-sm font-medium text-foreground/80">{label}</p>
                <p className="mt-0.5 text-3xl font-extrabold tracking-tight tabular-nums">
                  {value.toLocaleString("ko-KR")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
              <ChevronRight
                aria-hidden="true"
                className="absolute top-5 right-4 size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
