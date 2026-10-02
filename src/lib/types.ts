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

export interface Church {
  id: string;
  name: string;
  /** 카드에 보여 줄 한 줄 소개 */
  slogan: string;
  pastorName: string;
  memberCount: number;
  /** 시·도 (예: 서울, 경기). 지도 페이지의 지역 필터 단위 */
  region: string;
  /** 시·군·구 (예: 용산구, 성남시) */
  district: string;
  /** 동까지만 적는다. 목데이터가 실제 건물을 가리키지 않게 하기 위함 */
  address: string;
  lat: number;
  lng: number;
  imageUrl: string;
  tags: string[];
}
