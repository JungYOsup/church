import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { FilterChips } from "@/components/common/FilterChips";
import { PostRow } from "@/components/post/PostRow";
import { getPostCategories, getRecentPosts } from "@/lib/data/posts";
import { parseSearchParam } from "@/lib/search-params";

// 탭 제목에 고른 분류를 넣지 않는다. 검색어에 따라 바뀌는 제목은 Link 기본 미리 불러오기에서 어긋난다
// (docs/lessons.md). 바뀐 결과는 개수 문구의 role="status"로 알린다
export const metadata: Metadata = { title: "커뮤니티" };

// searchParams를 읽으므로 요청마다 그려진다. 그래서 "N시간 전"도 요청 시각 기준이다
export default async function CommunityPage({ searchParams }: PageProps<"/community">) {
  const category = parseSearchParam((await searchParams).category);
  const [posts, categories] = await Promise.all([getRecentPosts({ category }), getPostCategories()]);
  // "N시간 전"의 기준 시각은 데이터를 받은 뒤에 잡는다. 먼저 잡으면 정확히 경계에 걸린 글이 한 단위 내려간다
  const now = new Date();
  // 칩에 없는 분류는 주소에서 온 아무 글자일 수 있으므로 화면에 다시 적지 않는다
  const isKnownCategory = categories.some((option) => option === category);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1 break-keep">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Users aria-hidden="true" className="size-6 text-primary" />
          커뮤니티
        </h1>
        <p className="text-muted-foreground">교회들의 이야기와 기도제목을 나눠주세요.</p>
      </header>

      {/* 글이 없으면 고를 분류도 없으므로 칩을 숨긴다 */}
      {categories.length > 0 && (
        <FilterChips
          label="분류 필터"
          basePath="/community"
          param="category"
          options={categories}
          selected={category}
        />
      )}

      <section aria-labelledby="post-list-title" className="flex flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <h2 id="post-list-title" className="text-lg font-bold text-foreground">
            글 목록
          </h2>
          <p role="status" className="text-sm text-muted-foreground">
            {category === null
              ? `총 ${posts.length}개`
              : isKnownCategory
                ? `${category} ${posts.length}개`
                : `맞는 글 ${posts.length}개`}
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-4 py-16 text-center break-keep">
            <p className="text-muted-foreground">
              {category ? "고른 분류의 글이 없습니다." : "아직 올라온 글이 없습니다."}
            </p>
            {category && (
              <Link
                href="/community"
                className="rounded-md text-sm font-medium text-primary outline-hidden hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                전체 글 보기
              </Link>
            )}
          </div>
        ) : (
          <ul role="list" className="divide-y rounded-xl border bg-card px-4 sm:px-5">
            {posts.map((post) => (
              <PostRow key={post.id} post={post} now={now} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
