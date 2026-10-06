import Image from "next/image";
import type { ReactNode } from "react";
import {
  CalendarDays,
  Church,
  CircleCheck,
  CircleX,
  Clock,
  Info,
  type LucideIcon,
  Megaphone,
  PenLine,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { ChurchFacts } from "@/components/church/ChurchFacts";
import { ArticleRow } from "@/components/common/ArticleRow";
import { TagList } from "@/components/common/TagList";
import { NOTICE_CATEGORY_TONES } from "@/components/notice/categoryTones";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getChurch } from "@/lib/data/churches";
import { getUpcomingEvents } from "@/lib/data/events";
import { getRecentNotices } from "@/lib/data/notices";
import { getMyVerification } from "@/lib/data/user";
import { formatDate, formatEventDateTime } from "@/lib/datetime";
import type { RepVerification, UserProfile, VerificationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS: Record<VerificationStatus, { label: string; className: string; icon: LucideIcon }> = {
  approved: { label: "인증 완료", className: "bg-tag-green-soft text-tag-green", icon: CircleCheck },
  pending: { label: "심사 중", className: "bg-tag-orange-soft text-tag-orange", icon: Clock },
  rejected: { label: "반려", className: "bg-tag-rose-soft text-tag-rose", icon: CircleX },
};

/** 대표자 대시보드: 인증 상태, 내 교회 정보, 내 교회의 다가오는 행사와 공지 */
export async function MyChurchPanel({ user }: { user: UserProfile }) {
  const [church, verification, events, notices] = await Promise.all([
    getChurch(user.churchId),
    getMyVerification(),
    getUpcomingEvents({ churchId: user.churchId }),
    getRecentNotices({ churchId: user.churchId }),
  ]);

  if (!church) {
    return <p className="rounded-xl border bg-card px-4 py-16 text-center text-muted-foreground">관리하는 교회를 찾지 못했습니다.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-start gap-2 rounded-lg bg-accent px-4 py-3 text-sm text-foreground/80 break-keep">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
        교회 정보 고치기와 행사·공지 쓰기는 로그인 기능과 함께 2단계에서 열립니다.
      </p>

      <div className="grid gap-4 lg:grid-cols-3">
        <VerificationSection verification={verification} churchName={church.name} />

        <Section
          titleId="my-church-title"
          title="교회 정보"
          icon={Church}
          className="lg:col-span-2"
          action={{ label: "교회 정보 고치기", icon: PenLine }}
        >
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative aspect-16/10 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-56">
              {/* 목데이터 사진은 그 교회의 실제 모습이 아니라 장식으로 둔다. 이름은 옆 제목이 알려 준다 */}
              <Image src={church.imageUrl} alt="" fill sizes="(min-width: 640px) 224px, 100vw" className="object-cover" />
            </div>
            <div className="flex min-w-0 flex-col gap-2 break-keep">
              <h3 className="text-lg font-bold text-foreground">{church.name}</h3>
              <p className="text-muted-foreground">{church.slogan}</p>
              <ChurchFacts church={church} />
              <TagList tags={church.tags} />
            </div>
          </div>
        </Section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section titleId="my-events-title" title="다가오는 행사" icon={CalendarDays} action={{ label: "새 행사 등록", icon: Plus }}>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">다가오는 행사가 없습니다.</p>
          ) : (
            <ul role="list" className="divide-y">
              {events.map((event) => (
                <li key={event.id} className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 break-keep">
                  <h3 className="font-semibold text-foreground">{event.title}</h3>
                  <time dateTime={event.startsAt} className="text-sm text-muted-foreground">
                    {formatEventDateTime(event.startsAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section titleId="my-notices-title" title="공지" icon={Megaphone} action={{ label: "새 공지 쓰기", icon: Plus }}>
          {notices.length === 0 ? (
            <p className="text-sm text-muted-foreground">올린 공지가 없습니다.</p>
          ) : (
            <ul role="list" className="-my-4 divide-y">
              {notices.map((notice) => (
                <ArticleRow
                  key={notice.id}
                  imageUrl={notice.church.imageUrl}
                  title={notice.title}
                  category={notice.category}
                  categoryClassName={NOTICE_CATEGORY_TONES[notice.category]}
                  excerpt={notice.summary}
                  meta={<time dateTime={notice.publishedAt}>{formatDate(notice.publishedAt)}</time>}
                />
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}

function VerificationSection({ verification, churchName }: { verification: RepVerification; churchName: string }) {
  const { label, className, icon: Icon } = STATUS[verification.status];
  const dateLabel = verification.reviewedAt ? (verification.status === "approved" ? "승인일" : "반려일") : "신청일";
  const date = verification.reviewedAt ?? verification.requestedAt;

  return (
    <Section titleId="verification-title" title="인증 상태" icon={ShieldCheck}>
      <div className="flex flex-col items-start gap-3 break-keep">
        <Badge className={cn("h-7 px-3 text-sm", className)}>
          <Icon data-icon="inline-start" aria-hidden="true" />
          {label}
        </Badge>
        <p className="text-sm text-foreground/80">
          {verification.status === "approved"
            ? `${churchName}의 대표자로 인증되었습니다. 교회 정보와 행사·공지를 관리할 수 있습니다.`
            : verification.status === "pending"
              ? "관리자가 증빙 서류를 확인하고 있습니다."
              : "증빙 서류를 다시 확인해 신청해 주세요."}
        </p>
        <p className="text-sm text-muted-foreground">
          {dateLabel} <time dateTime={date}>{formatDate(date)}</time>
        </p>
      </div>
    </Section>
  );
}

/** 대시보드의 칸: 아이콘과 제목(h2), 오른쪽 위 비활성 버튼, 내용 */
function Section({
  titleId,
  title,
  icon: Icon,
  action,
  className,
  children,
}: {
  titleId: string;
  title: string;
  icon: LucideIcon;
  /** 오른쪽 위 버튼. 1단계에서는 비활성이고, 이유는 대시보드 위 안내가 알려 준다 */
  action?: { label: string; icon: LucideIcon };
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={titleId}
      className={cn("flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-5 shadow-xs", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={titleId} className="flex items-center gap-2 text-base font-bold text-foreground">
          <Icon aria-hidden="true" className="size-5 text-primary" />
          {title}
        </h2>
        {action && (
          <Button type="button" variant="outline" size="sm" disabled>
            <action.icon data-icon="inline-start" aria-hidden="true" />
            {action.label}
          </Button>
        )}
      </div>
      {children}
    </section>
  );
}
