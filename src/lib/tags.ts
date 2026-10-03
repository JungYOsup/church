/**
 * 항목들에 붙은 태그를 중복 없이 모은다. 그 태그가 붙은 항목이 많은 순서이고, 같으면 가나다순이다.
 * 한 항목에 같은 태그가 여러 번 붙어 있어도 한 번으로 센다.
 */
export function collectTags(items: { tags: string[] }[]): string[] {
  const counts = new Map<string, number>();
  for (const tag of items.flatMap((item) => [...new Set(item.tags)])) {
    counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([tagA, countA], [tagB, countB]) => countB - countA || tagA.localeCompare(tagB, "ko"))
    .map(([tag]) => tag);
}

/**
 * 그 태그가 붙은 항목만 원래 순서대로 남긴다. tag가 null이면 전부 돌려준다.
 * 이름이 정확히 같을 때만 맞는 것으로 본다("연합"은 "연합행사"를 잡지 않는다).
 */
export function filterByTag<T extends { tags: string[] }>(items: T[], tag: string | null): T[] {
  if (tag === null) return [...items];
  return items.filter((item) => item.tags.includes(tag));
}
