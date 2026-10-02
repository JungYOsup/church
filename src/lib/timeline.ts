const timeOf = (iso: string) => new Date(iso).getTime();

/**
 * 시작 시각이 지금 이후인 항목을 빠른 순서로 limit개 고른다.
 * 지금 시작하는 항목은 포함하고, 시작 시각이 같으면 원래 순서를 지킨다(Array#sort는 안정 정렬).
 */
export function pickUpcoming<T extends { startsAt: string }>(
  items: T[],
  now: Date,
  limit: number,
): T[] {
  return items
    .filter((item) => timeOf(item.startsAt) >= now.getTime())
    .sort((a, b) => timeOf(a.startsAt) - timeOf(b.startsAt))
    .slice(0, limit);
}

/** 최신 항목부터 limit개 고른다. 시각이 같으면 원래 순서를 지킨다 */
export function pickLatest<T>(items: T[], dateOf: (item: T) => string, limit: number): T[] {
  return [...items].sort((a, b) => timeOf(dateOf(b)) - timeOf(dateOf(a))).slice(0, limit);
}
