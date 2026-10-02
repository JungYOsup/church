import { atSeoulTime } from "@/lib/datetime";
import type { Notice } from "@/lib/types";

// 가상의 공지들이다. 행사처럼 "서울 날짜로 며칠 전 오전 9시"로 적고 지금 시각을 받아 만든다.
// 제목에는 월·계절을 넣지 않는다. 날짜가 상대값이라 어느 때 보아도 어색하지 않게 하기 위함이다.
// 배열은 일부러 날짜순이 아니게 둔다.
const NOTICES: (Omit<Notice, "publishedAt"> & { dayOffset: number })[] = [
  { id: "notice-1", churchId: "church-6", title: "주일 예배 시간 변경 안내", category: "일정변경", dayOffset: -14 },
  { id: "notice-2", churchId: "church-2", title: "지역 연합 기도회 장소가 변경되었습니다", category: "일정변경", dayOffset: -3 },
  { id: "notice-3", churchId: "church-10", title: "교회 주차장 이용 안내", category: "일반공지", dayOffset: -8 },
  { id: "notice-4", churchId: "church-9", title: "교회 홈페이지 개편 안내", category: "일반공지", dayOffset: -25 },
  { id: "notice-5", churchId: "church-1", title: "특별새벽기도회에 여러분을 초대합니다", category: "행사안내", dayOffset: -1 },
  { id: "notice-6", churchId: "church-4", title: "연합 찬양제 참가팀 모집", category: "모집안내", dayOffset: -11 },
  { id: "notice-7", churchId: "church-5", title: "다음세대 수련회 등록 안내", category: "모집안내", dayOffset: -5 },
  { id: "notice-8", churchId: "church-8", title: "새가족 교육 과정 개강", category: "행사안내", dayOffset: -18 },
];

export function createMockNotices(now: Date): Notice[] {
  return NOTICES.map(({ dayOffset, ...notice }) => ({
    ...notice,
    publishedAt: atSeoulTime(now, dayOffset, "09:00").toISOString(),
  }));
}
