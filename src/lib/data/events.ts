import { withChurch } from "@/lib/data/churches";
import { createMockEvents } from "@/lib/mock/events";
import { collectTags, filterByTag } from "@/lib/tags";
import { pickUpcoming } from "@/lib/timeline";
import type { ChurchEvent, WithChurch } from "@/lib/types";

/**
 * 지금 이후에 시작하는 행사를 빠른 순서로 돌려준다.
 * tag를 주면 그 태그가 붙은 행사만, limit을 주지 않으면 전부다.
 */
export async function getUpcomingEvents({
  limit = Infinity,
  tag = null,
}: { limit?: number; tag?: string | null } = {}): Promise<WithChurch<ChurchEvent>[]> {
  const now = new Date();
  return withChurch(pickUpcoming(filterByTag(createMockEvents(now), tag), now, limit));
}

/** 다가오는 행사에 붙은 태그. 많이 쓰인 태그가 앞이다 */
export async function getUpcomingEventTags(): Promise<string[]> {
  const now = new Date();
  return collectTags(pickUpcoming(createMockEvents(now), now, Infinity));
}
