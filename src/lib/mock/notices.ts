import { atSeoulTime } from "@/lib/datetime";
import type { Notice } from "@/lib/types";

// 가상의 공지들이다. 행사처럼 "서울 날짜로 며칠 전 오전 9시"로 적고 지금 시각을 받아 만든다.
// 제목과 요약에는 월·계절을 넣지 않는다. 날짜가 상대값이라 어느 때 보아도 어색하지 않게 하기 위함이다.
// 배열은 일부러 날짜순이 아니게 둔다.
const NOTICES: (Omit<Notice, "publishedAt"> & { dayOffset: number })[] = [
  {
    id: "notice-1",
    churchId: "church-6",
    title: "주일 예배 시간 변경 안내",
    summary: "다음 주일부터 2부 예배가 오전 11시에서 11시 30분으로 바뀝니다. 1부와 3부는 그대로입니다.",
    category: "일정변경",
    dayOffset: -14,
  },
  {
    id: "notice-2",
    churchId: "church-2",
    title: "지역 연합 기도회 장소가 변경되었습니다",
    summary: "참석 인원이 늘어 장소를 본당에서 교육관 2층 대강당으로 옮깁니다. 모이는 시간은 그대로입니다.",
    category: "일정변경",
    dayOffset: -3,
  },
  {
    id: "notice-3",
    churchId: "church-10",
    title: "교회 주차장 이용 안내",
    summary: "주일 오전에는 주차장이 붐비니 가까운 공영주차장을 이용해 주세요. 어르신과 장애인 차량은 먼저 안내합니다.",
    category: "일반공지",
    dayOffset: -8,
  },
  {
    id: "notice-4",
    churchId: "church-9",
    title: "교회 홈페이지 개편 안내",
    summary: "홈페이지가 새 모습으로 바뀌었습니다. 예배 영상과 주보를 휴대폰에서도 편하게 볼 수 있습니다.",
    category: "일반공지",
    dayOffset: -25,
  },
  {
    id: "notice-5",
    churchId: "church-1",
    title: "특별새벽기도회에 여러분을 초대합니다",
    summary: "한 주 동안 새벽 5시 30분에 본당에서 함께 기도합니다. 이웃 교회 성도님도 누구나 오실 수 있습니다.",
    category: "행사안내",
    dayOffset: -1,
  },
  {
    id: "notice-6",
    churchId: "church-4",
    title: "연합 찬양제 참가팀 모집",
    summary: "지역 교회 찬양팀이 함께 서는 연합 찬양제에 참가할 팀을 모집합니다. 팀마다 두 곡을 준비해 주세요.",
    category: "모집안내",
    dayOffset: -11,
  },
  {
    id: "notice-7",
    churchId: "church-5",
    title: "다음세대 수련회 등록 안내",
    summary: "중고등부 수련회 참가 신청을 받습니다. 교회 사무실이나 담당 교역자에게 신청해 주세요.",
    category: "모집안내",
    dayOffset: -5,
  },
  {
    id: "notice-8",
    churchId: "church-8",
    title: "새가족 교육 과정 개강",
    summary: "처음 오신 분을 위한 4주 과정의 새가족 교육을 시작합니다. 주일 예배 뒤 소예배실에서 모입니다.",
    category: "행사안내",
    dayOffset: -18,
  },
];

export function createMockNotices(now: Date): Notice[] {
  return NOTICES.map(({ dayOffset, ...notice }) => ({
    ...notice,
    publishedAt: atSeoulTime(now, dayOffset, "09:00").toISOString(),
  }));
}
