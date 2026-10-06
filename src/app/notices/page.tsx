import type { Metadata } from "next";
import Link from "next/link";
import { Bell } from "lucide-react";
import { FilterChips } from "@/components/common/FilterChips";
import { NoticeRow } from "@/components/notice/NoticeRow";
import { getNoticeCategories, getRecentNotices } from "@/lib/data/notices";
import { parseSearchParam } from "@/lib/search-params";

// 탭 제목에 고른 분류를 넣지 않는다. 검색어에 따라 바뀌는 제목은 Link 기본 미리 불러오기에서 어긋난다
// (docs/lessons.md). 바뀐 결과는 개수 문구의 role="status"로 알린다
export const metadata: Metadata = { title: "공지" };

// searchParams를 읽으므로 요청마다 그려진다
export default async function NoticesPage({ searchParams }: PageProps<"/notices">) {
  const category = parseSearchParam((await searchParams).category);
  const [notices, categories] = await Promise.all([getRecentNotices({ category }), getNoticeCategories()]);
  // 칩에 없는 분류는 주소에서 온 아무 글자일 수 있으므로 화면에 다시 적지 않는다
  const isKnownCategory = categories.some((option) => option === category);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1 break-keep">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Bell aria-hidden="true" className="size-6 text-primary" />
          공지
        </h1>
        <p className="text-muted-foreground">교회들의 중요한 소식을 확인해보세요.</p>
      </header>

      {/* 공지가 없으면 고를 분류도 없으므로 칩을 숨긴다 */}
      {categories.length > 0 && (
        <FilterChips
          label="분류 필터"
          basePath="/notices"
          param="category"
          options={categories}
          selected={category}
        />
      )}

      <section aria-labelledby="notice-list-title" className="flex flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <h2 id="notice-list-title" className="text-lg font-bold text-foreground">
            공지 목록
          </h2>
          <p role="status" className="text-sm text-muted-foreground">
            {category === null
              ? `총 ${notices.length}개`
              : isKnownCategory
                ? `${category} ${notices.length}개`
                : `맞는 공지 ${notices.length}개`}
          </p>
        </div>

        {notices.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-4 py-16 text-center break-keep">
            <p className="text-muted-foreground">
              {category ? "고른 분류의 공지가 없습니다." : "등록된 공지가 없습니다."}
            </p>
            {category && (
              <Link
                href="/notices"
                className="rounded-md text-sm font-medium text-primary outline-hidden hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                전체 공지 보기
              </Link>
            )}
          </div>
        ) : (
          <ul role="list" className="divide-y rounded-xl border bg-card px-4 sm:px-5">
            {notices.map((notice) => (
              <NoticeRow key={notice.id} notice={notice} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
