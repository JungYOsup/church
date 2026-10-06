import { Users } from "lucide-react";
import { FeedRow } from "@/components/home/FeedRow";
import { SectionCard } from "@/components/home/SectionCard";
import { POST_CATEGORY_TONES } from "@/components/post/categoryTones";
import { getRecentPosts } from "@/lib/data/posts";
import { formatRelativeTime } from "@/lib/datetime";

const POST_COUNT = 4;

export async function CommunityFeed() {
  const posts = await getRecentPosts({ limit: POST_COUNT });
  // "N시간 전"은 서버가 그릴 때 한 번 계산한다. 클라이언트에서 다시 계산하면 시각이 달라 hydration이 어긋난다.
  // 홈은 정적 페이지라 그리는 시각은 빌드 시각이다(요청마다가 아님). 다시 그리는 주기는 Supabase 단계에서 정한다
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
              categoryClassName={POST_CATEGORY_TONES[post.category]}
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
