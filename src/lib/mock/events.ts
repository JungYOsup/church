import { atSeoulTime } from "@/lib/datetime";
import type { ChurchEvent } from "@/lib/types";

// 가상의 행사들이다. 날짜를 고정하면 시간이 지나 모두 지난 행사가 되므로,
// "서울 날짜로 오늘부터 며칠 뒤, 서울 시각 몇 시"로 적고 지금 시각을 받아 만든다.
// 지난 행사와 홈에 다 들어가지 않는 먼 행사를 섞고, 배열은 일부러 날짜순이 아니게 둔다.
const EVENTS: (Omit<ChurchEvent, "startsAt"> & { dayOffset: number; time: string })[] = [
  {
    id: "event-1",
    churchId: "church-10",
    title: "가정 행복 세미나",
    dayOffset: 9,
    time: "14:00",
    imageUrl: "/images/events/gathering.jpg",
    tags: ["가정사역", "세미나"],
  },
  {
    id: "event-2",
    churchId: "church-12",
    title: "지역 연합 기도회",
    dayOffset: -3,
    time: "19:30",
    imageUrl: "/images/events/prayer.jpg",
    tags: ["기도", "연합"],
  },
  {
    id: "event-3",
    churchId: "church-1",
    title: "청년 연합 찬양집회",
    dayOffset: 2,
    time: "19:00",
    imageUrl: "/images/events/worship.jpg",
    tags: ["찬양", "청년", "연합행사"],
  },
  {
    id: "event-4",
    churchId: "church-3",
    title: "연합 감사예배",
    dayOffset: 27,
    time: "11:00",
    imageUrl: "/images/events/worship.jpg",
    tags: ["예배", "연합"],
  },
  {
    id: "event-5",
    churchId: "church-5",
    title: "다음세대 말씀 집회",
    dayOffset: 6,
    time: "18:00",
    imageUrl: "/images/events/bible.jpg",
    tags: ["말씀", "다음세대", "집회"],
  },
  {
    id: "event-6",
    churchId: "church-8",
    title: "새가족 환영 모임",
    dayOffset: -1,
    time: "11:00",
    imageUrl: "/images/events/gathering.jpg",
    tags: ["새가족", "교제"],
  },
  {
    id: "event-7",
    churchId: "church-6",
    title: "선교 나눔 바자회",
    dayOffset: 15,
    time: "11:00",
    imageUrl: "/images/events/volunteer.jpg",
    tags: ["선교", "나눔"],
  },
  {
    id: "event-8",
    churchId: "church-2",
    title: "지역사회 연합 봉사활동",
    dayOffset: 4,
    time: "10:00",
    imageUrl: "/images/events/volunteer.jpg",
    tags: ["봉사", "지역섬김", "연합"],
  },
  {
    id: "event-9",
    churchId: "church-11",
    title: "청소년 체육대회",
    dayOffset: 20,
    time: "10:00",
    imageUrl: "/images/events/gathering.jpg",
    tags: ["다음세대", "체육"],
  },
  {
    id: "event-10",
    churchId: "church-4",
    title: "연합 성가대 발표회",
    dayOffset: 12,
    time: "19:30",
    imageUrl: "/images/events/choir.jpg",
    tags: ["찬양", "연합"],
  },
];

export function createMockEvents(now: Date): ChurchEvent[] {
  return EVENTS.map(({ dayOffset, time, ...event }) => ({
    ...event,
    startsAt: atSeoulTime(now, dayOffset, time).toISOString(),
  }));
}
