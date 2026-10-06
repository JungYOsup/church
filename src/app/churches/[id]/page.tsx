import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bell, CalendarDays, ChevronRight, Church as ChurchIcon, type LucideIcon, Map as MapIcon, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { ChurchFacts } from "@/components/church/ChurchFacts";
import { ArticleRow } from "@/components/common/ArticleRow";
import { TagList } from "@/components/common/TagList";
import { EventCard } from "@/components/event/EventCard";
import { ChurchMap } from "@/components/map/ChurchMap";
import { NOTICE_CATEGORY_TONES } from "@/components/notice/categoryTones";
import { getChurch } from "@/lib/data/churches";
import { getUpcomingEvents } from "@/lib/data/events";
import { getRecentNotices } from "@/lib/data/notices";
import { formatDate } from "@/lib/datetime";

// 행사 페이지와 같은 격자: 모바일 1열, 640px부터 2열, 1024px부터 3열, 1280px부터 4열
const CARD_IMAGE_SIZES =
  "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

// 경로 값(id)은 경로마다 따로 담기므로, 검색어와 달리 탭 제목에 넣어도 미리 불러오기에서 어긋나지 않는다
export async function generateMetadata({ params }: PageProps<"/churches/[id]">): Promise<Metadata> {
  const church = await getChurch((await params).id);
  return { title: church?.name ?? "교회를 찾을 수 없음" };
}

// generateStaticParams가 없어 요청마다 그려진다. 다가오는 행사가 빌드 시각에 고정되지 않는다
export default async function ChurchPage({ params }: PageProps<"/churches/[id]">) {
  const { id } = await params;
  const church = await getChurch(id);
  if (!church) notFound();
  const [events, notices] = await Promise.all([
    getUpcomingEvents({ churchId: church.id }),
    getRecentNotices({ churchId: church.id }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 break-keep">
        <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin aria-hidden="true" className="size-4 text-primary" />
          {church.region} {church.district}
        </p>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{church.name}</h1>
        <p className="text-muted-foreground">{church.slogan}</p>
        <TagList tags={church.tags} />
      </header>

      {/* 1024px부터 교회 정보와 위치를 나란히 둔다 */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section aria-labelledby="church-info-title" className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-xs">
          <h2 id="church-info-title" className="flex items-center gap-2 text-base font-bold text-foreground">
            <ChurchIcon aria-hidden="true" className="size-5 text-primary" />
            교회 정보
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative aspect-16/10 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-72">
              {/* 목데이터 사진은 그 교회의 실제 모습이 아니라 장식으로 둔다. 이름은 위 제목이 알려 준다 */}
              <Image
                src={church.imageUrl}
                alt=""
                fill
                sizes="(min-width: 640px) 288px, 100vw"
                className="object-cover"
                loading="eager"
                fetchPriority="high"
              />
            </div>
            <ChurchFacts church={church} className="self-start break-keep" />
          </div>
        </section>

        <section aria-labelledby="church-location-title" className="flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <h2 id="church-location-title" className="flex items-center gap-2 text-base font-bold text-foreground">
              <MapIcon aria-hidden="true" className="size-5 text-primary" />
              위치
            </h2>
            <Link
              href={{ pathname: "/map", query: { region: church.region } }}
              className="inline-flex items-center gap-0.5 rounded-md text-sm font-medium text-primary outline-hidden hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              교회 지도에서 보기
              <ChevronRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <ChurchMap churches={[church]} className="h-60 lg:h-full lg:min-h-48" />
        </section>
      </div>

      <Section titleId="church-events-title" title="다가오는 행사" icon={CalendarDays}>
        {events.length === 0 ? (
          <EmptyMessage>다가오는 행사가 없습니다.</EmptyMessage>
        ) : (
          <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event) => (
              <li key={event.id}>
                <EventCard event={event} imageSizes={CARD_IMAGE_SIZES} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section titleId="church-notices-title" title="공지" icon={Bell}>
        {notices.length === 0 ? (
          <EmptyMessage>올린 공지가 없습니다.</EmptyMessage>
        ) : (
          <ul role="list" className="divide-y rounded-xl border bg-card px-4 sm:px-5">
            {notices.map((notice) => (
              // 공지는 따로 사진이 없어 그 교회 사진을 썸네일로 쓴다
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
  );
}

function Section({
  titleId,
  title,
  icon: Icon,
  children,
}: {
  titleId: string;
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-3">
      <h2 id={titleId} className="flex items-center gap-2 text-lg font-bold text-foreground">
        <Icon aria-hidden="true" className="size-5 text-primary" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function EmptyMessage({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border bg-card px-4 py-10 text-center text-muted-foreground break-keep">{children}</p>;
}
