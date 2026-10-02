import { describe, expect, it } from "vitest";
import {
  atSeoulTime,
  formatDate,
  formatEventBadge,
  formatEventDateTime,
  formatRelativeTime,
} from "@/lib/datetime";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

it("단위 테스트는 배포 서버(Vercel)처럼 UTC에서 돈다", () => {
  // vitest.config.mts가 TZ를 UTC로 고정한다. 시간대를 빼먹은 코드를 KST 컴퓨터에서도 잡기 위함
  expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe("UTC");
});

describe("atSeoulTime", () => {
  // 서울 기준 10월 3일 00:30. UTC로는 아직 10월 2일이다
  const base = new Date("2026-10-02T15:30:00.000Z");

  it("서울 날짜에서 며칠 뒤의 서울 시각을 돌려준다", () => {
    expect(atSeoulTime(base, 1, "19:00").toISOString()).toBe("2026-10-04T10:00:00.000Z");
  });

  it("음수 오프셋은 며칠 전이다", () => {
    expect(atSeoulTime(base, -1, "09:00").toISOString()).toBe("2026-10-02T00:00:00.000Z");
  });

  it("오프셋 0은 서울 기준 오늘이다", () => {
    expect(atSeoulTime(base, 0, "00:00").toISOString()).toBe("2026-10-02T15:00:00.000Z");
  });
});

describe("formatEventDateTime", () => {
  it.each([
    ["저녁", "2026-10-04T10:00:00.000Z", "2026. 10. 4 (일) 오후 7:00"],
    ["오전", "2026-10-04T01:00:00.000Z", "2026. 10. 4 (일) 오전 10:00"],
    ["정오", "2026-10-04T03:00:00.000Z", "2026. 10. 4 (일) 오후 12:00"],
    ["서울은 다음 날인 시각", "2026-10-04T16:00:00.000Z", "2026. 10. 5 (월) 오전 1:00"],
  ])("%s: 서울 시각으로 날짜, 요일, 시간을 적는다", (_case, iso, expected) => {
    expect(formatEventDateTime(iso)).toBe(expected);
  });
});

describe("formatEventBadge", () => {
  it("서울 기준 월.일과 요일을 나눠 돌려준다", () => {
    expect(formatEventBadge("2026-10-04T16:00:00.000Z")).toEqual({ monthDay: "10.5", weekday: "월" });
  });
});

describe("formatDate", () => {
  it("서울 기준 날짜를 끝에 점 없이 적는다", () => {
    expect(formatDate("2026-10-04T16:00:00.000Z")).toBe("2026. 10. 5");
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-10-02T03:00:00.000Z");
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();

  it.each([
    ["30초 전", "방금 전", ago(30_000)],
    ["5분 전", "5분 전", ago(5 * MINUTE)],
    ["59분 전", "59분 전", ago(59 * MINUTE)],
    ["2시간 전", "2시간 전", ago(2 * HOUR)],
    ["26시간 전", "1일 전", ago(26 * HOUR)],
    ["6일 23시간 전", "6일 전", ago(6 * DAY + 23 * HOUR)],
    ["서버 시계 차이로 10초 뒤", "방금 전", ago(-10_000)],
  ])("%s → %s", (_case, expected, iso) => {
    expect(formatRelativeTime(iso, now)).toBe(expected);
  });

  it("7일이 지나면 날짜로 적는다", () => {
    expect(formatRelativeTime(ago(7 * DAY), now)).toBe("2026. 9. 25");
  });
});
