import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { EventCard } from "@/components/event/EventCard";
import { EventTagFilter } from "@/components/event/EventTagFilter";
import { getUpcomingEventTags, getUpcomingEvents } from "@/lib/data/events";
import { parseTagParam } from "@/lib/tags";

// 탭 제목에 고른 태그를 넣지 않는다. Link 기본 미리 불러오기는 page·metadata를 검색어 없이 한 칸에 담아
// (next/dist/client/components/segment-cache/vary-path.js), 칩을 눌러 이동하면 다른 태그(또는 "행사")의 제목이 남았다.
// 바뀐 결과는 개수 문구의 role="status"로 알린다
export const metadata: Metadata = { title: "행사" };

// 모바일 1열, 640px부터 2열, 1024px부터 3열, 1280px부터 4열
const CARD_IMAGE_SIZES =
  "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

// searchParams를 읽으므로 요청마다 그려진다. 그래서 "다가오는"의 기준이 빌드 시각이 아니라 요청 시각이다
export default async function EventsPage({ searchParams }: PageProps<"/events">) {
  const tag = parseTagParam((await searchParams).tag);
  const [events, tags] = await Promise.all([getUpcomingEvents({ tag }), getUpcomingEventTags()]);
  // 칩에 없는 태그는 주소에서 온 아무 글자일 수 있으므로 화면에 다시 적지 않는다
  const isKnownTag = tag !== null && tags.includes(tag);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1 break-keep">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <CalendarDays aria-hidden="true" className="size-6 text-primary" />
          행사
        </h1>
        <p className="text-muted-foreground">지역 교회의 다양한 행사에 참여해보세요.</p>
      </header>

      {/* 다가오는 행사가 없으면 고를 태그도 없으므로 칩을 숨긴다 */}
      {tags.length > 0 && <EventTagFilter tags={tags} selected={tag} />}

      <section aria-labelledby="event-list-title" className="flex flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <h2 id="event-list-title" className="text-lg font-bold text-foreground">
            다가오는 행사
          </h2>
          <p role="status" className="text-sm text-muted-foreground">
            {tag === null
              ? `총 ${events.length}개`
              : isKnownTag
                ? `${tag} 태그 ${events.length}개`
                : `맞는 행사 ${events.length}개`}
          </p>
        </div>

        {events.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-4 py-16 text-center break-keep">
            <p className="text-muted-foreground">
              {tag ? "고른 태그가 붙은 다가오는 행사가 없습니다." : "예정된 행사가 없습니다."}
            </p>
            {tag && (
              <Link
                href="/events"
                className="rounded-md text-sm font-medium text-primary outline-hidden hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                전체 행사 보기
              </Link>
            )}
          </div>
        ) : (
          <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event) => (
              <li key={event.id}>
                <EventCard event={event} imageSizes={CARD_IMAGE_SIZES} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
