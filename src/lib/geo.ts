import { collectTags } from "@/lib/tags";

/** 지도에 보이는 영역. 남·북은 위도, 서·동은 경도 */
export interface MapBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

/**
 * 범위 안의 항목만 원래 순서와 원래 객체 그대로 돌려준다.
 * 지도 가장자리에 걸친 핀도 화면에 보이므로 경계 위의 점은 포함한다.
 */
export function filterWithinBounds<T extends { lat: number; lng: number }>(
  items: T[],
  bounds: MapBounds,
): T[] {
  return items.filter(
    ({ lat, lng }) =>
      lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east,
  );
}

/**
 * 교회가 있는 지역(시·도)을 중복 없이 모은다. 교회가 많은 지역부터이고, 같으면 가나다순이다.
 * 순서 규칙이 태그 칩과 같아서 collectTags에 지역을 태그 하나로 넘긴다.
 */
export function collectRegions(churches: { region: string }[]): string[] {
  return collectTags(churches.map((church) => ({ tags: [church.region] })));
}

/**
 * 그 지역의 교회만 원래 순서대로 남긴다. region이 null이면 전부 돌려준다.
 * 이름이 정확히 같을 때만 맞는 것으로 본다.
 */
export function filterByRegion<T extends { region: string }>(churches: T[], region: string | null): T[] {
  if (region === null) return [...churches];
  return churches.filter((church) => church.region === region);
}
