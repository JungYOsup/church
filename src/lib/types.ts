export type UserRole = "member" | "church_rep" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  /** 직분 (예: 집사, 권사, 장로) */
  title: string;
  /** 소속 교회. 대표자면 관리하는 교회다 */
  churchId: string;
  churchName: string;
  role: UserRole;
}

/** 대표자 인증 신청의 처리 상태 */
export type VerificationStatus = "pending" | "approved" | "rejected";

/** 대표자 인증 신청. 관리자가 증빙을 보고 승인하거나 반려한다 */
export interface RepVerification {
  churchId: string;
  status: VerificationStatus;
  /** 신청 시각 (ISO 8601) */
  requestedAt: string;
  /** 승인·반려 시각 (ISO 8601). 아직 처리하지 않았으면 null */
  reviewedAt: string | null;
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

/** 행사·공지·글 목록에 함께 보여 줄 교회 정보 */
export type ChurchSummary = Pick<Church, "id" | "name" | "imageUrl">;

/** 화면에 교회 정보를 붙여 보여 줄 때의 꼴. Supabase 단계에서는 쿼리의 join 결과다 */
export type WithChurch<T> = T & { church: ChurchSummary };

/** 교회가 여는 행사. 브라우저의 Event와 이름이 겹치지 않게 ChurchEvent로 둔다 */
export interface ChurchEvent {
  id: string;
  churchId: string;
  title: string;
  /** 시작 시각 (ISO 8601) */
  startsAt: string;
  imageUrl: string;
  tags: string[];
}

/** 공지 분류. 이 순서가 공지 페이지 칩의 순서다 */
export const NOTICE_CATEGORIES = ["행사안내", "일정변경", "모집안내", "일반공지"] as const;
export type NoticeCategory = (typeof NOTICE_CATEGORIES)[number];

/** 교회가 올린 공지. 목록 썸네일은 그 교회 사진을 쓴다 */
export interface Notice {
  id: string;
  churchId: string;
  title: string;
  /** 목록에 보여 줄 한두 줄 요약 */
  summary: string;
  category: NoticeCategory;
  /** 게시 시각 (ISO 8601) */
  publishedAt: string;
}

/** 커뮤니티 글 분류. 이 순서가 커뮤니티 페이지 칩의 순서다 */
export const POST_CATEGORIES = ["기도제목", "사역나눔", "선교소식", "봉사후기"] as const;
export type PostCategory = (typeof POST_CATEGORIES)[number];

/** 커뮤니티 글. 교회는 글쓴이가 속한 교회다 */
export interface Post {
  id: string;
  churchId: string;
  title: string;
  /** 목록에 보여 줄 본문 앞부분 */
  excerpt: string;
  category: PostCategory;
  /** 작성 시각 (ISO 8601) */
  createdAt: string;
  imageUrl: string;
}

/** 통합 검색 결과. 묶음마다 그 목록 페이지와 같은 순서다 */
export interface SearchResults {
  churches: Church[];
  /** 다가오는 행사만 */
  events: WithChurch<ChurchEvent>[];
  notices: WithChurch<Notice>[];
  posts: WithChurch<Post>[];
}
