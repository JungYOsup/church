import { createMockVerification, mockCurrentUser, mockUnreadNotificationCount } from "@/lib/mock/user";
import type { RepVerification, UserProfile } from "@/lib/types";

export async function getCurrentUser(): Promise<UserProfile> {
  return mockCurrentUser;
}

export async function getUnreadNotificationCount(): Promise<number> {
  return mockUnreadNotificationCount;
}

/** 현재 사용자의 대표자 인증 신청과 처리 상태 */
export async function getMyVerification(): Promise<RepVerification> {
  return createMockVerification(new Date());
}
