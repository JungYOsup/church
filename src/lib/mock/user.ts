import { atSeoulTime } from "@/lib/datetime";
import type { RepVerification, UserProfile } from "@/lib/types";

export const mockCurrentUser: UserProfile = {
  id: "user-1",
  name: "김은혜",
  title: "집사",
  churchId: "church-1",
  churchName: "서연교회",
  role: "church_rep",
};

// 현재 사용자의 대표자 인증. 행사처럼 날짜를 고정하지 않고 "서울 날짜로 며칠 전 몇 시"로 적는다.
export function createMockVerification(now: Date): RepVerification {
  return {
    churchId: mockCurrentUser.churchId,
    status: "approved",
    requestedAt: atSeoulTime(now, -40, "10:00").toISOString(),
    reviewedAt: atSeoulTime(now, -37, "10:00").toISOString(),
  };
}
