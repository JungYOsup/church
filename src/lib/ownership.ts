/**
 * 그 교회의 항목(행사·공지 등)만 원래 순서대로 남긴다. churchId가 null이면 전부 돌려준다.
 * id가 정확히 같을 때만 맞는 것으로 본다.
 */
export function filterByChurch<T extends { churchId: string }>(items: T[], churchId: string | null): T[] {
  if (churchId === null) return [...items];
  return items.filter((item) => item.churchId === churchId);
}
