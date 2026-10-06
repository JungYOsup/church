import { collectCategories, filterByCategory } from "@/lib/categories";
import { withChurch } from "@/lib/data/churches";
import { createMockNotices } from "@/lib/mock/notices";
import { filterByChurch } from "@/lib/ownership";
import { pickLatest } from "@/lib/timeline";
import { NOTICE_CATEGORIES, type Notice, type NoticeCategory, type WithChurch } from "@/lib/types";

/**
 * 공지를 최신순으로 돌려준다.
 * category를 주면 그 분류의 공지만, churchId를 주면 그 교회의 공지만, limit을 주지 않으면 전부다.
 */
export async function getRecentNotices({
  limit = Infinity,
  category = null,
  churchId = null,
}: { limit?: number; category?: string | null; churchId?: string | null } = {}): Promise<WithChurch<Notice>[]> {
  const notices = filterByChurch(filterByCategory(createMockNotices(new Date()), category), churchId);
  return withChurch(pickLatest(notices, (notice) => notice.publishedAt, limit));
}

/** 공지가 있는 분류. 정해진 분류 순서(NOTICE_CATEGORIES)를 따른다 */
export async function getNoticeCategories(): Promise<NoticeCategory[]> {
  return collectCategories(createMockNotices(new Date()), NOTICE_CATEGORIES);
}
