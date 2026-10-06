import { collectCategories, filterByCategory } from "@/lib/categories";
import { withChurch } from "@/lib/data/churches";
import { createMockPosts } from "@/lib/mock/posts";
import { pickLatest } from "@/lib/timeline";
import { POST_CATEGORIES, type Post, type PostCategory, type WithChurch } from "@/lib/types";

/**
 * 커뮤니티 글을 최신순으로 돌려준다.
 * category를 주면 그 분류의 글만, limit을 주지 않으면 전부다.
 */
export async function getRecentPosts({
  limit = Infinity,
  category = null,
}: { limit?: number; category?: string | null } = {}): Promise<WithChurch<Post>[]> {
  const posts = filterByCategory(createMockPosts(new Date()), category);
  return withChurch(pickLatest(posts, (post) => post.createdAt, limit));
}

/** 글이 있는 분류. 정해진 분류 순서(POST_CATEGORIES)를 따른다 */
export async function getPostCategories(): Promise<PostCategory[]> {
  return collectCategories(createMockPosts(new Date()), POST_CATEGORIES);
}
