import type { NoticeCategory } from "@/lib/types";

// 공지 분류 배지 색. 홈 "최근 공지" 칸과 공지 페이지가 같이 쓴다.
// globals.css의 태그 토큰이고, Tailwind가 클래스를 찾을 수 있게 완성된 문자열로 적는다.
export const NOTICE_CATEGORY_TONES: Record<NoticeCategory, string> = {
  행사안내: "bg-tag-blue-soft text-tag-blue",
  일정변경: "bg-tag-violet-soft text-tag-violet",
  모집안내: "bg-tag-green-soft text-tag-green",
  일반공지: "bg-tag-gray-soft text-tag-gray",
};
