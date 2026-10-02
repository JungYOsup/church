import { mockChurches, mockRecommendedChurchIds } from "@/lib/mock/churches";
import type { Church, WithChurch } from "@/lib/types";

export async function getChurches(): Promise<Church[]> {
  return mockChurches;
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
