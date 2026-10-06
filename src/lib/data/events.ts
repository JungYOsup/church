import { withChurch } from "@/lib/data/churches";
import { createMockEvents } from "@/lib/mock/events";
import { filterByChurch } from "@/lib/ownership";
import { collectTags, filterByTag } from "@/lib/tags";
import { pickUpcoming } from "@/lib/timeline";
import type { ChurchEvent, WithChurch } from "@/lib/types";

/**
 * 지금 이후에 시작하는 행사를 빠른 순서로 돌려준다.
 * tag를 주면 그 태그가 붙은 행사만, churchId를 주면 그 교회의 행사만, limit을 주지 않으면 전부다.
 */
export async function getUpcomingEvents({
  limit = Infinity,
  tag = null,
  churchId = null,
}: { limit?: number; tag?: string | null; churchId?: string | null } = {}): Promise<WithChurch<ChurchEvent>[]> {
  const now = new Date();
  const events = filterByChurch(filterByTag(createMockEvents(now), tag), churchId);
  return withChurch(pickUpcoming(events, now, limit));
}

/** 다가오는 행사에 붙은 태그. 많이 쓰인 태그가 앞이다 */
export async function getUpcomingEventTags(): Promise<string[]> {
  const now = new Date();
  return collectTags(pickUpcoming(createMockEvents(now), now, Infinity));
}
