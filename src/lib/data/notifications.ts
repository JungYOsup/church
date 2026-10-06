import { createMockNotifications } from "@/lib/mock/notifications";
import { pickLatest } from "@/lib/timeline";
import type { UserNotification } from "@/lib/types";

/** 현재 사용자에게 온 알림을 최신순으로 돌려준다. limit을 주지 않으면 전부다 */
export async function getNotifications({ limit = Infinity }: { limit?: number } = {}): Promise<UserNotification[]> {
  return pickLatest(createMockNotifications(new Date()), (notification) => notification.createdAt, limit);
}

/** 현재 사용자의 안 읽은 알림 수 */
export async function getUnreadNotificationCount(): Promise<number> {
  return createMockNotifications(new Date()).filter((notification) => !notification.read).length;
}
