import { describe, expect, it } from "vitest";
import { collectCategories, filterByCategory } from "@/lib/categories";

const ORDER = ["행사안내", "일정변경", "모집안내", "일반공지"];

describe("collectCategories", () => {
  it("항목에 나온 순서가 아니라 정해진 순서로 돌려준다", () => {
    const items = [{ category: "일반공지" }, { category: "모집안내" }, { category: "행사안내" }];

    expect(collectCategories(items, ORDER)).toEqual(["행사안내", "모집안내", "일반공지"]);
  });

  it("항목이 없는 분류는 빼고, 여러 번 나와도 한 번만 돌려준다", () => {
    const items = [{ category: "일정변경" }, { category: "일정변경" }];

    expect(collectCategories(items, ORDER)).toEqual(["일정변경"]);
  });

  it("항목이 없으면 빈 목록이다", () => {
    expect(collectCategories([], ORDER)).toEqual([]);
  });
});

describe("filterByCategory", () => {
  const items = [
    { title: "a", category: "일정변경" },
    { title: "b", category: "행사안내" },
    { title: "c", category: "일정변경" },
  ];

  it("분류가 null이면 전부를 원래 순서대로 새 배열로 돌려준다", () => {
    const result = filterByCategory(items, null);

    expect(result.map((item) => item.title)).toEqual(["a", "b", "c"]);
    expect(result).not.toBe(items);
  });

  it("분류가 정확히 같은 항목만 원래 순서대로 남긴다", () => {
    expect(filterByCategory(items, "일정변경").map((item) => item.title)).toEqual(["a", "c"]);
    // 앞부분만 같은 값은 맞지 않는다
    expect(filterByCategory(items, "일정")).toEqual([]);
  });

  it("없는 분류면 빈 목록이다", () => {
    expect(filterByCategory(items, "기도제목")).toEqual([]);
  });

  it("원래 객체를 그대로 돌려주고 입력 배열을 바꾸지 않는다", () => {
    const before = [...items];
    const result = filterByCategory(items, "행사안내");

    expect(result[0]).toBe(items[1]);
    expect(items).toEqual(before);
  });
});
