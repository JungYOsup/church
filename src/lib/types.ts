export type UserRole = "member" | "church_rep" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  /** 직분 (예: 집사, 권사, 장로) */
  title: string;
  churchName: string;
  role: UserRole;
}

/** 홈 통계 카드에 보여 줄 연합 현황 숫자 */
export interface Stats {
  /** 등록된 교회 수 */
  churchCount: number;
  /** 교회가 있는 지역(시·도) 수 */
  regionCount: number;
  /** 이번 주에 열리는 행사 수 */
  weeklyEventCount: number;
  /** 교회들이 공유한 공지 수 */
  noticeCount: number;
  /** 인증을 마친 교회 대표자 수 */
  verifiedRepresentativeCount: number;
}
