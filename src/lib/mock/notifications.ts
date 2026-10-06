import { mockChurches } from "@/lib/mock/churches";
import { createMockEvents } from "@/lib/mock/events";
import { createMockNotices } from "@/lib/mock/notices";
import { createMockVerification } from "@/lib/mock/user";
import type { UserNotification } from "@/lib/types";

const MINUTE = 60 * 1000;

function findById<T extends { id: string }>(items: T[], id: string): T {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`알림이 가리키는 ${id}가 목데이터에 없습니다.`);
  return item;
}

// 현재 사용자(서연교회 대표자)에게 온 알림 5개, 안 읽은 것 3개.
// 행사·공지 알림의 제목과 시각은 그 목데이터에서 가져와, 원본이 바뀌어도 알림이 어긋나지 않게 한다.
// 행사·새 교회 알림은 글처럼 "몇 분 전"으로 적고, 단위가 바뀌는 경계에서 10분 비켜 둔다(mock/posts.ts와 같은 이유).
// 배열은 일부러 시각순이 아니게 둔다. 정렬은 데이터 함수가 한다.
export function createMockNotifications(now: Date): UserNotification[] {
  const minutesAgo = (minutes: number) => new Date(now.getTime() - minutes * MINUTE).toISOString();
  const churchName = (id: string) => findById(mockChurches, id).name;

  const event = findById(createMockEvents(now), "event-5");
  const newChurch = findById(mockChurches, "church-15");
  const notices = createMockNotices(now);
  const recentNotice = findById(notices, "notice-2");
  const olderNotice = findById(notices, "notice-6");
  const verification = createMockVerification(now);

  return [
    {
      id: "notification-3",
      kind: "notice",
      message: `${churchName(recentNotice.churchId)} 새 공지: ${recentNotice.title}`,
      href: `/churches/${recentNotice.churchId}`,
      createdAt: recentNotice.publishedAt,
      read: false,
    },
    {
      id: "notification-1",
      kind: "event",
      message: `${churchName(event.churchId)}에서 새 행사를 올렸습니다: ${event.title}`,
      href: `/churches/${event.churchId}`,
      createdAt: minutesAgo(2 * 60 + 10),
      read: false,
    },
    {
      id: "notification-5",
      kind: "verification",
      message: `${churchName(verification.churchId)} 대표자 인증이 승인되었습니다`,
      href: "/admin",
      createdAt: verification.reviewedAt ?? verification.requestedAt,
      read: true,
    },
    {
      id: "notification-2",
      kind: "church",
      message: `${newChurch.name}가 연합에 새로 함께합니다`,
      href: `/churches/${newChurch.id}`,
      createdAt: minutesAgo(24 * 60 + 10),
      read: false,
    },
    {
      id: "notification-4",
      kind: "notice",
      message: `${churchName(olderNotice.churchId)} 새 공지: ${olderNotice.title}`,
      href: `/churches/${olderNotice.churchId}`,
      createdAt: olderNotice.publishedAt,
      read: true,
    },
  ];
}
