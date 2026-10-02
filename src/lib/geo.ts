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
