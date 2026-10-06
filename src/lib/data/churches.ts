import { collectRegions, filterByRegion } from "@/lib/geo";
import { mockChurches, mockRecommendedChurchIds } from "@/lib/mock/churches";
import type { Church, WithChurch } from "@/lib/types";

/** 교회를 정해 둔 순서대로 돌려준다. region(시·도)을 주면 그 지역의 교회만이다 */
export async function getChurches({ region = null }: { region?: string | null } = {}): Promise<Church[]> {
  return filterByRegion(mockChurches, region);
}

/** id로 교회 하나를 찾는다. 없으면 null */
export async function getChurch(id: string): Promise<Church | null> {
  return mockChurches.find((church) => church.id === id) ?? null;
}

/** 교회가 있는 지역(시·도). 교회가 많은 지역이 앞이다 */
export async function getChurchRegions(): Promise<string[]> {
  return collectRegions(mockChurches);
}

/** 홈에 보여 줄 추천 교회를 정해 둔 순서대로 돌려준다 */
export async function getRecommendedChurches(): Promise<Church[]> {
  return mockRecommendedChurchIds.map((id) => {
    const church = mockChurches.find((candidate) => candidate.id === id);
    if (!church) throw new Error(`추천 교회 ${id}가 목데이터에 없습니다.`);
    return church;
  });
}

/** 행사·공지·글에 churchId로 교회 이름과 사진을 붙인다. Supabase 단계에서는 쿼리의 join으로 바뀐다 */
export function withChurch<T extends { churchId: string }>(items: T[]): WithChurch<T>[] {
  return items.map((item) => {
    const church = mockChurches.find((candidate) => candidate.id === item.churchId);
    if (!church) throw new Error(`교회 ${item.churchId}가 목데이터에 없습니다.`);
    return { ...item, church: { id: church.id, name: church.name, imageUrl: church.imageUrl } };
  });
}
