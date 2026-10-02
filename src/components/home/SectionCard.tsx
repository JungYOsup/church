import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SectionCardProps {
  /** h2의 id. section이 aria-labelledby로 이 제목을 이름으로 쓴다 */
  titleId: string;
  title: string;
  icon: LucideIcon;
  description?: string;
  /**
   * 머리 오른쪽 위 링크. label을 주지 않으면 "더보기"이고,
   * 화면 읽기 프로그램에는 칸 이름을 붙여 "<제목> 더보기"로 읽힌다.
   */
  link: { href: string; label?: string };
  contentClassName?: string;
  children: ReactNode;
}

/** 홈 카드 칸의 공통 틀: 아이콘과 제목, 설명, 오른쪽 위 링크, 내용 */
export function SectionCard({
  titleId,
  title,
  icon: Icon,
  description,
  link,
  contentClassName,
  children,
}: SectionCardProps) {
  return (
    <section aria-labelledby={titleId} className="min-w-0">
      <Card className="h-full shadow-sm">
        <CardHeader>
          <CardTitle>
            <h2 id={titleId} className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Icon aria-hidden="true" className="size-5 text-primary" />
              {title}
            </h2>
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
          <CardAction>
            <Link
              href={link.href}
              className="inline-flex items-center gap-0.5 rounded-md text-sm font-medium text-primary outline-hidden hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {link.label ?? (
                <>
                  <span className="sr-only">{title} </span>더보기
                </>
              )}
              <ChevronRight aria-hidden="true" className="size-4" />
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent className={contentClassName}>{children}</CardContent>
      </Card>
    </section>
  );
}
