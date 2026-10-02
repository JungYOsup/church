import { Users } from "lucide-react";
import { FeedRow } from "@/components/home/FeedRow";
import { SectionCard } from "@/components/home/SectionCard";
import { getRecentPosts } from "@/lib/data/posts";
import { formatRelativeTime } from "@/lib/datetime";
import type { PostCategory } from "@/lib/types";

const POST_COUNT = 4;

// globals.css의 태그 토큰. Tailwind가 클래스를 찾을 수 있게 완성된 문자열로 적는다.
const CATEGORY_TONES: Record<PostCategory, string> = {
  기도제목: "bg-tag-rose-soft text-tag-rose",
  사역나눔: "bg-tag-blue-soft text-tag-blue",
  선교소식: "bg-tag-green-soft text-tag-green",
  봉사후기: "bg-tag-orange-soft text-tag-orange",
};

export async function CommunityFeed() {
  const posts = await getRecentPosts(POST_COUNT);
  // "N시간 전"은 서버에서 한 번 계산한다. 클라이언트에서 다시 계산하면 시각이 달라 hydration이 어긋난다
  const now = new Date();

  return (
    <SectionCard
      titleId="community-feed-title"
      title="커뮤니티 최신 글"
      icon={Users}
      description="교회들의 이야기와 기도제목을 나눠주세요."
      link={{ href: "/community" }}
    >
      {posts.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">아직 올라온 글이 없습니다.</p>
      ) : (
        <ul role="list" className="flex flex-col gap-3">
          {posts.map((post) => (
            <FeedRow
              key={post.id}
              imageUrl={post.imageUrl}
              title={post.title}
              category={post.category}
              categoryClassName={CATEGORY_TONES[post.category]}
              meta={
                <>
                  {post.church.name}
                  <span aria-hidden="true"> · </span>
                  <time dateTime={post.createdAt}>{formatRelativeTime(post.createdAt, now)}</time>
                </>
              }
            />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
