import { describe, expect, it } from "vitest";
import { filterWithinBounds, type MapBounds } from "@/lib/geo";

// 서울 도심을 덮는 사각형: 남서 (37.5, 126.9) ~ 북동 (37.6, 127.0)
const BOUNDS: MapBounds = { south: 37.5, west: 126.9, north: 37.6, east: 127.0 };

describe("filterWithinBounds", () => {
  it("범위 안의 항목만 원래 순서대로 남긴다", () => {
    const items = [
      { name: "안1", lat: 37.55, lng: 126.95 },
      { name: "밖", lat: 37.7, lng: 126.95 },
      { name: "안2", lat: 37.52, lng: 126.98 },
    ];

    expect(filterWithinBounds(items, BOUNDS).map((item) => item.name)).toEqual(["안1", "안2"]);
  });

  it.each([
    ["북쪽", { lat: 37.6001, lng: 126.95 }],
    ["남쪽", { lat: 37.4999, lng: 126.95 }],
    ["동쪽", { lat: 37.55, lng: 127.0001 }],
    ["서쪽", { lat: 37.55, lng: 126.8999 }],
  ])("%s 바깥의 점은 빠진다", (_side, point) => {
    expect(filterWithinBounds([point], BOUNDS)).toEqual([]);
  });

  it("경계와 꼭짓점 위의 점은 포함한다", () => {
    const onEdges = [
      { lat: 37.6, lng: 126.95 }, // 북쪽 변
      { lat: 37.5, lng: 126.95 }, // 남쪽 변
      { lat: 37.55, lng: 127.0 }, // 동쪽 변
      { lat: 37.55, lng: 126.9 }, // 서쪽 변
      { lat: 37.5, lng: 126.9 }, // 남서 꼭짓점
      { lat: 37.6, lng: 127.0 }, // 북동 꼭짓점
    ];

    expect(filterWithinBounds(onEdges, BOUNDS)).toHaveLength(onEdges.length);
  });

  it("빈 목록은 빈 목록을 돌려준다", () => {
    expect(filterWithinBounds([], BOUNDS)).toEqual([]);
  });

  it("원래 객체를 그대로 돌려준다", () => {
    const church = { id: "church-1", name: "서연교회", lat: 37.55, lng: 126.95 };

    const [result] = filterWithinBounds([church], BOUNDS);

    expect(result).toBe(church);
  });
});
