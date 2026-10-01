import { mockCurrentUser, mockUnreadNotificationCount } from "@/lib/mock/user";
import type { UserProfile } from "@/lib/types";

export async function getCurrentUser(): Promise<UserProfile> {
  return mockCurrentUser;
}

export async function getUnreadNotificationCount(): Promise<number> {
  return mockUnreadNotificationCount;
}
