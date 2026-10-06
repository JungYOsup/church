import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { ChurchCard } from "@/components/church/ChurchCard";
import { EventCard } from "@/components/event/EventCard";
import { NoticeRow } from "@/components/notice/NoticeRow";
import { PostRow } from "@/components/post/PostRow";
import { SearchForm } from "@/components/search/SearchForm";
import { searchSite } from "@/lib/data/search";
import { parseSearchParam } from "@/lib/search-params";

// 탭 제목에 검색어를 넣지 않는다. 검색어에 따라 바뀌는 제목은 Link 기본 미리 불러오기에서 어긋난다
// (docs/lessons.md). 결과 수는 role="status"로 알린다
export const metadata: Metadata = { title: "검색" };

// 행사 페이지와 같은 격자: 모바일 1열, 640px부터 2열, 1024px부터 3열, 1280px부터 4열
const CARD_GRID = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
const CARD_IMAGE_SIZES =
  "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

// searchParams를 읽으므로 요청마다 그려진다. 그래서 "다가오는 행사"와 "N시간 전"도 요청 시각 기준이다
export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  // 공백뿐인 검색어(?q=+++)는 찾을 낱말이 없으므로 검색어 없이 들어온 것과 같게 본다
  const query = parseSearchParam((await searchParams).q)?.trim() || null;
  const results = await searchSite(query ?? "");
  // "N시간 전"의 기준 시각은 데이터를 받은 뒤에 잡는다(커뮤니티 페이지와 같은 이유)
  const now = new Date();
  const total =
    results.churches.length + results.events.length + results.notices.length + results.posts.length;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1 break-keep">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Search aria-hidden="true" className="size-6 text-primary" />
          검색
        </h1>
        <p className="text-muted-foreground">교회와 행사, 공지, 커뮤니티 글을 한 번에 찾아보세요.</p>
      </header>

      <div className="flex flex-col gap-3">
        <SearchForm query={query} />
        {/* 알림 영역은 검색어가 없을 때도 비워 둔 채 같은 자리에 두어, 검색한 뒤 바뀐 글자가 읽히게 한다.
            검색어는 주소에서 온 아무 글자일 수 있으므로 여기에 다시 적지 않는다(입력칸에만 둔다) */}
        <p role="status" className="text-sm text-muted-foreground">
          {query === null ? "" : `검색 결과 ${total}개`}
        </p>
      </div>

      {query === null ? (
        <EmptyMessage>교회 이름, 지역, 목사님 이름이나 행사·공지·글 제목으로 찾아보세요.</EmptyMessage>
      ) : total === 0 ? (
        <EmptyMessage>
          맞는 결과가 없습니다.
          <span className="mt-1 block text-sm">낱말을 줄이거나 다른 낱말로 찾아보세요.</span>
        </EmptyMessage>
      ) : (
        <div className="flex flex-col gap-8">
          {results.churches.length > 0 && (
            <ResultGroup titleId="search-churches" title="교회" count={results.churches.length}>
              <ul role="list" className={CARD_GRID}>
                {results.churches.map((church) => (
                  <li key={church.id}>
                    <ChurchCard church={church} imageSizes={CARD_IMAGE_SIZES} />
                  </li>
                ))}
              </ul>
            </ResultGroup>
          )}
          {results.events.length > 0 && (
            <ResultGroup titleId="search-events" title="행사" count={results.events.length}>
              <ul role="list" className={CARD_GRID}>
                {results.events.map((event) => (
                  <li key={event.id}>
                    <EventCard event={event} imageSizes={CARD_IMAGE_SIZES} />
                  </li>
                ))}
              </ul>
            </ResultGroup>
          )}
          {results.notices.length > 0 && (
            <ResultGroup titleId="search-notices" title="공지" count={results.notices.length}>
              <ul role="list" className="divide-y rounded-xl border bg-card px-4 sm:px-5">
                {results.notices.map((notice) => (
                  <NoticeRow key={notice.id} notice={notice} />
                ))}
              </ul>
            </ResultGroup>
          )}
          {results.posts.length > 0 && (
            <ResultGroup titleId="search-posts" title="커뮤니티 글" count={results.posts.length}>
              <ul role="list" className="divide-y rounded-xl border bg-card px-4 sm:px-5">
                {results.posts.map((post) => (
                  <PostRow key={post.id} post={post} now={now} />
                ))}
              </ul>
            </ResultGroup>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyMessage({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border bg-card px-4 py-16 text-center text-muted-foreground break-keep">{children}</p>
  );
}

function ResultGroup({
  titleId,
  title,
  count,
  children,
}: {
  titleId: string;
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <h2 id={titleId} className="text-lg font-bold text-foreground">
          {title}
        </h2>
        <span className="text-sm text-muted-foreground">{count}개</span>
      </div>
      {children}
    </section>
  );
}
