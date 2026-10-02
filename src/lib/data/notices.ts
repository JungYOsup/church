import { withChurch } from "@/lib/data/churches";
import { createMockNotices } from "@/lib/mock/notices";
import { pickLatest } from "@/lib/timeline";
import type { Notice, WithChurch } from "@/lib/types";

/** 최근 공지를 최신순으로 limit개 돌려준다 */
export async function getRecentNotices(limit: number): Promise<WithChurch<Notice>[]> {
  const notices = createMockNotices(new Date());
  return withChurch(pickLatest(notices, (notice) => notice.publishedAt, limit));
}
