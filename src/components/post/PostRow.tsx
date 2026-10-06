import { ArticleRow } from "@/components/common/ArticleRow";
import { POST_CATEGORY_TONES } from "@/components/post/categoryTones";
import { formatRelativeTime } from "@/lib/datetime";
import type { Post, WithChurch } from "@/lib/types";

/** 커뮤니티 글 한 줄. 커뮤니티 페이지와 검색 결과가 같이 쓴다. now는 "N시간 전"의 기준 시각이다 */
export function PostRow({ post, now }: { post: WithChurch<Post>; now: Date }) {
  return (
    <ArticleRow
      imageUrl={post.imageUrl}
      title={post.title}
      category={post.category}
      categoryClassName={POST_CATEGORY_TONES[post.category]}
      excerpt={post.excerpt}
      meta={
        <>
          {post.church.name}
          <span aria-hidden="true"> · </span>
          <time dateTime={post.createdAt}>{formatRelativeTime(post.createdAt, now)}</time>
        </>
      }
    />
  );
}
