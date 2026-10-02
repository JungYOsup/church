import { mockChurches, mockRecommendedChurchIds } from "@/lib/mock/churches";
import type { Church } from "@/lib/types";

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
