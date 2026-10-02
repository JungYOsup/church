import { withChurch } from "@/lib/data/churches";
import { createMockPosts } from "@/lib/mock/posts";
import { pickLatest } from "@/lib/timeline";
import type { Post, WithChurch } from "@/lib/types";

/** 커뮤니티 최신 글을 최신순으로 limit개 돌려준다 */
export async function getRecentPosts(limit: number): Promise<WithChurch<Post>[]> {
  const posts = createMockPosts(new Date());
  return withChurch(pickLatest(posts, (post) => post.createdAt, limit));
}
