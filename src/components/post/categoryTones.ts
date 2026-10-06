import type { PostCategory } from "@/lib/types";

// 커뮤니티 글 분류 배지 색. 홈 "커뮤니티 최신 글" 칸과 커뮤니티 페이지가 같이 쓴다.
// globals.css의 태그 토큰이고, Tailwind가 클래스를 찾을 수 있게 완성된 문자열로 적는다.
export const POST_CATEGORY_TONES: Record<PostCategory, string> = {
  기도제목: "bg-tag-rose-soft text-tag-rose",
  사역나눔: "bg-tag-blue-soft text-tag-blue",
  선교소식: "bg-tag-green-soft text-tag-green",
  봉사후기: "bg-tag-orange-soft text-tag-orange",
};
