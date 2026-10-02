import { withChurch } from "@/lib/data/churches";
import { createMockEvents } from "@/lib/mock/events";
import { pickUpcoming } from "@/lib/timeline";
import type { ChurchEvent, WithChurch } from "@/lib/types";

/** 지금 이후에 시작하는 행사를 빠른 순서로 limit개 돌려준다 */
export async function getUpcomingEvents(limit: number): Promise<WithChurch<ChurchEvent>[]> {
  const now = new Date();
  return withChurch(pickUpcoming(createMockEvents(now), now, limit));
}
