import type { Post } from "@/lib/types";

const MINUTE = 60 * 1000;

// 가상의 커뮤니티 글들이다. "몇 분 전"으로 적고 지금 시각을 받아 만든다.
// "2시간 전"처럼 단위가 바뀌는 경계에서 10분쯤 비켜 둔다. 화면을 그리는 시각이 데이터를 만든 시각과
// 몇 ms만 달라도 정확히 2시간인 글은 "1시간 전"으로 내려가기 때문이다.
// 썸네일은 행사 사진을 다시 쓴다. 배열은 일부러 날짜순이 아니게 둔다.
const POSTS: (Omit<Post, "createdAt"> & { minutesAgo: number })[] = [
  {
    id: "post-1",
    churchId: "church-5",
    title: "선교지 소식과 기도편지를 나눕니다",
    category: "선교소식",
    minutesAgo: 26 * 60 + 10,
    imageUrl: "/images/events/bible.jpg",
  },
  {
    id: "post-2",
    churchId: "church-14",
    title: "연탄 나눔 봉사 후기",
    category: "봉사후기",
    minutesAgo: 8 * 24 * 60,
    imageUrl: "/images/events/volunteer.jpg",
  },
  {
    id: "post-3",
    churchId: "church-3",
    title: "이번 주 지역 전도 활동을 위해 기도해주세요",
    category: "기도제목",
    minutesAgo: 2 * 60 + 10,
    imageUrl: "/images/events/prayer.jpg",
  },
  {
    id: "post-4",
    churchId: "church-11",
    title: "주일학교 교사 모집에 함께해 주세요",
    category: "사역나눔",
    minutesAgo: 3 * 24 * 60,
    imageUrl: "/images/events/gathering.jpg",
  },
  {
    id: "post-5",
    churchId: "church-10",
    title: "지역 어르신들을 위한 봉사활동 이야기",
    category: "봉사후기",
    minutesAgo: 30 * 60 + 10,
    imageUrl: "/images/events/volunteer.jpg",
  },
  {
    id: "post-6",
    churchId: "church-15",
    title: "선교사님 귀국 보고 모임 소식",
    category: "선교소식",
    minutesAgo: 12 * 24 * 60,
    imageUrl: "/images/events/gathering.jpg",
  },
  {
    id: "post-7",
    churchId: "church-2",
    title: "청년부 연합 예배가 은혜 가운데 진행되었습니다!",
    category: "사역나눔",
    minutesAgo: 5 * 60 + 10,
    imageUrl: "/images/events/worship.jpg",
  },
  {
    id: "post-8",
    churchId: "church-13",
    title: "단기선교 준비를 위해 기도 부탁드립니다",
    category: "기도제목",
    minutesAgo: 5 * 24 * 60,
    imageUrl: "/images/events/prayer.jpg",
  },
];

export function createMockPosts(now: Date): Post[] {
  return POSTS.map(({ minutesAgo, ...post }) => ({
    ...post,
    createdAt: new Date(now.getTime() - minutesAgo * MINUTE).toISOString(),
  }));
}
