import { describe, expect, it } from "vitest";
import { collectRegions, filterByRegion, filterWithinBounds, type MapBounds } from "@/lib/geo";

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

describe("collectRegions", () => {
  it("교회가 많은 지역부터 중복 없이 돌려준다", () => {
    const churches = [
      { region: "경기" },
      { region: "서울" },
      { region: "서울" },
      { region: "경기" },
      { region: "서울" },
    ];

    expect(collectRegions(churches)).toEqual(["서울", "경기"]);
  });

  it("교회 수가 같으면 가나다순이다", () => {
    const churches = [{ region: "부산" }, { region: "경기" }, { region: "서울" }];

    expect(collectRegions(churches)).toEqual(["경기", "부산", "서울"]);
  });

  it("교회가 없으면 빈 목록이다", () => {
    expect(collectRegions([])).toEqual([]);
  });
});

describe("filterByRegion", () => {
  const churches = [
    { name: "a", region: "서울" },
    { name: "b", region: "경기" },
    { name: "c", region: "서울" },
  ];

  it("지역이 null이면 전부를 원래 순서대로 새 배열로 돌려준다", () => {
    const result = filterByRegion(churches, null);

    expect(result.map((church) => church.name)).toEqual(["a", "b", "c"]);
    expect(result).not.toBe(churches);
  });

  it("지역이 정확히 같은 교회만 원래 순서대로 남긴다", () => {
    expect(filterByRegion(churches, "서울").map((church) => church.name)).toEqual(["a", "c"]);
    // 앞부분만 같은 값은 맞지 않는다
    expect(filterByRegion(churches, "서")).toEqual([]);
  });

  it("없는 지역이면 빈 목록이다", () => {
    expect(filterByRegion(churches, "부산")).toEqual([]);
  });

  it("원래 객체를 그대로 돌려주고 입력 배열을 바꾸지 않는다", () => {
    const before = [...churches];
    const result = filterByRegion(churches, "경기");

    expect(result[0]).toBe(churches[1]);
    expect(churches).toEqual(before);
  });
});
