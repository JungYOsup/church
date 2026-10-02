// 날짜는 모두 서울 시각으로 적는다. 배포 서버(Vercel)는 UTC라서 시간대를 빼먹으면 9시간 어긋난다.
const SEOUL = "Asia/Seoul";
// 한국은 서머타임이 없어 UTC+9로 고정이다
const SEOUL_OFFSET_MS = 9 * 60 * 60 * 1000;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** base의 서울 날짜에서 dayOffset일 뒤, 서울 시각 time("HH:mm")인 순간 */
export function atSeoulTime(base: Date, dayOffset: number, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  // UTC 필드를 읽으면 서울 벽시계가 되도록 9시간 민다
  const seoul = new Date(base.getTime() + SEOUL_OFFSET_MS);
  const seoulWallClock = Date.UTC(
    seoul.getUTCFullYear(),
    seoul.getUTCMonth(),
    seoul.getUTCDate() + dayOffset,
    hours,
    minutes,
  );
  return new Date(seoulWallClock - SEOUL_OFFSET_MS);
}

const dateTimeFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: SEOUL,
  year: "numeric",
  month: "numeric",
  day: "numeric",
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
});

/**
 * Intl의 한국어 표기는 "2026. 10. 4. (일) 오후 7:00"처럼 일 뒤에 점이 붙어서,
 * 조각으로 받아 "2026. 10. 4 (일) 오후 7:00" 꼴로 다시 조립한다.
 */
function seoulParts(iso: string) {
  const parts = dateTimeFormat.formatToParts(new Date(iso));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((candidate) => candidate.type === type)?.value ?? "";
  return {
    year: part("year"),
    month: part("month"),
    day: part("day"),
    weekday: part("weekday"),
    dayPeriod: part("dayPeriod"),
    hour: part("hour"),
    minute: part("minute"),
  };
}

/** "2026. 10. 4 (일) 오후 7:00" */
export function formatEventDateTime(iso: string): string {
  const { year, month, day, weekday, dayPeriod, hour, minute } = seoulParts(iso);
  return `${year}. ${month}. ${day} (${weekday}) ${dayPeriod} ${hour}:${minute}`;
}

/** 행사 사진 위 날짜 배지: { monthDay: "10.4", weekday: "일" } */
export function formatEventBadge(iso: string): { monthDay: string; weekday: string } {
  const { month, day, weekday } = seoulParts(iso);
  return { monthDay: `${month}.${day}`, weekday };
}

/** "2026. 10. 4" */
export function formatDate(iso: string): string {
  const { year, month, day } = seoulParts(iso);
  return `${year}. ${month}. ${day}`;
}

/**
 * 지난 시간으로 "방금 전", "N분 전", "N시간 전", "N일 전"을 적고, 7일이 지나면 날짜로 적는다.
 * Intl.RelativeTimeFormat은 하루 전을 "어제"로 적어서 직접 만든다.
 */
export function formatRelativeTime(iso: string, now: Date): string {
  const elapsed = now.getTime() - new Date(iso).getTime();
  if (elapsed < MINUTE) return "방금 전";
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}분 전`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}시간 전`;
  if (elapsed < 7 * DAY) return `${Math.floor(elapsed / DAY)}일 전`;
  return formatDate(iso);
}
