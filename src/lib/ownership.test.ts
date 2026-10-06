import { describe, expect, it } from "vitest";
import { filterByChurch } from "@/lib/ownership";

describe("filterByChurch", () => {
  const items = [
    { title: "a", churchId: "church-2" },
    { title: "b", churchId: "church-1" },
    { title: "c", churchId: "church-2" },
  ];

  it("교회가 null이면 전부를 원래 순서대로 새 배열로 돌려준다", () => {
    const result = filterByChurch(items, null);

    expect(result.map((item) => item.title)).toEqual(["a", "b", "c"]);
    expect(result).not.toBe(items);
  });

  it("교회가 같은 항목만 원래 순서대로 남긴다", () => {
    expect(filterByChurch(items, "church-2").map((item) => item.title)).toEqual(["a", "c"]);
    // 앞부분만 같은 id는 맞지 않는다
    expect(filterByChurch(items, "church")).toEqual([]);
  });

  it("없는 교회면 빈 목록이다", () => {
    expect(filterByChurch(items, "church-99")).toEqual([]);
  });

  it("원래 객체를 그대로 돌려주고 입력 배열을 바꾸지 않는다", () => {
    const before = [...items];
    const result = filterByChurch(items, "church-1");

    expect(result[0]).toBe(items[1]);
    expect(items).toEqual(before);
  });
});
