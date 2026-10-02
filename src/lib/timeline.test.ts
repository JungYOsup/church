import { describe, expect, it } from "vitest";
import { pickLatest, pickUpcoming } from "@/lib/timeline";

const NOW = new Date("2026-10-02T03:00:00.000Z");

describe("pickUpcoming", () => {
  const events = [
    { title: "열흘 뒤", startsAt: "2026-10-12T03:00:00.000Z" },
    { title: "어제", startsAt: "2026-10-01T03:00:00.000Z" },
    { title: "내일", startsAt: "2026-10-03T03:00:00.000Z" },
    { title: "한 시간 전", startsAt: "2026-10-02T02:00:00.000Z" },
    { title: "사흘 뒤", startsAt: "2026-10-05T03:00:00.000Z" },
  ];

  it("지난 항목은 빼고 시작 시각이 빠른 순서로 돌려준다", () => {
    const titles = pickUpcoming(events, NOW, 10).map((event) => event.title);

    expect(titles).toEqual(["내일", "사흘 뒤", "열흘 뒤"]);
  });

  it("limit개만 남긴다", () => {
    const titles = pickUpcoming(events, NOW, 2).map((event) => event.title);

    expect(titles).toEqual(["내일", "사흘 뒤"]);
  });

  it("지금 시작하는 항목은 포함한다", () => {
    const startingNow = { title: "지금", startsAt: NOW.toISOString() };

    expect(pickUpcoming([startingNow], NOW, 10)).toEqual([startingNow]);
  });

  it("시작 시각이 같으면 원래 순서를 지킨다", () => {
    const sameTime = [
      { title: "먼저 등록", startsAt: "2026-10-03T03:00:00.000Z" },
      { title: "나중 등록", startsAt: "2026-10-03T03:00:00.000Z" },
    ];

    expect(pickUpcoming(sameTime, NOW, 10).map((event) => event.title)).toEqual([
      "먼저 등록",
      "나중 등록",
    ]);
  });

  it("입력 배열을 바꾸지 않는다", () => {
    const before = events.map((event) => event.title);

    pickUpcoming(events, NOW, 2);

    expect(events.map((event) => event.title)).toEqual(before);
  });

  it("남은 항목이 limit보다 적으면 있는 만큼 돌려준다", () => {
    expect(pickUpcoming(events, NOW, 10)).toHaveLength(3);
    expect(pickUpcoming([], NOW, 10)).toEqual([]);
  });
});

describe("pickLatest", () => {
  const notices = [
    { title: "사흘 전", publishedAt: "2026-09-29T00:00:00.000Z" },
    { title: "오늘", publishedAt: "2026-10-02T00:00:00.000Z" },
    { title: "열흘 전", publishedAt: "2026-09-22T00:00:00.000Z" },
    { title: "어제", publishedAt: "2026-10-01T00:00:00.000Z" },
  ];
  const publishedAt = (notice: { publishedAt: string }) => notice.publishedAt;

  it("최신 항목부터 limit개를 돌려준다", () => {
    const titles = pickLatest(notices, publishedAt, 3).map((notice) => notice.title);

    expect(titles).toEqual(["오늘", "어제", "사흘 전"]);
  });

  it("시각이 같으면 원래 순서를 지킨다", () => {
    const sameTime = [
      { title: "먼저 등록", publishedAt: "2026-10-01T00:00:00.000Z" },
      { title: "나중 등록", publishedAt: "2026-10-01T00:00:00.000Z" },
    ];

    expect(pickLatest(sameTime, publishedAt, 10).map((notice) => notice.title)).toEqual([
      "먼저 등록",
      "나중 등록",
    ]);
  });

  it("입력 배열을 바꾸지 않는다", () => {
    const before = notices.map((notice) => notice.title);

    pickLatest(notices, publishedAt, 2);

    expect(notices.map((notice) => notice.title)).toEqual(before);
  });
});
