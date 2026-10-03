import { describe, expect, it } from "vitest";
import { collectTags, filterByTag, parseTagParam } from "@/lib/tags";

describe("parseTagParam", () => {
  it("값이 없거나 비어 있으면 null을 돌려준다", () => {
    expect(parseTagParam(undefined)).toBeNull();
    expect(parseTagParam("")).toBeNull();
  });

  it("문자열은 그대로 돌려준다", () => {
    expect(parseTagParam("연합")).toBe("연합");
  });

  it("같은 이름이 여러 번 오면(?tag=a&tag=b) 첫 값을 돌려준다", () => {
    expect(parseTagParam(["찬양", "연합"])).toBe("찬양");
    expect(parseTagParam([])).toBeNull();
  });
});

describe("collectTags", () => {
  it("중복 없이 많이 쓰인 태그부터 돌려준다", () => {
    const items = [{ tags: ["청년", "연합"] }, { tags: ["연합", "찬양"] }, { tags: ["찬양", "연합"] }];

    expect(collectTags(items)).toEqual(["연합", "찬양", "청년"]);
  });

  it("쓰인 횟수가 같으면 가나다순이다", () => {
    const items = [{ tags: ["체육", "나눔"] }, { tags: ["가정사역", "예배", "연합행사"] }];

    expect(collectTags(items)).toEqual(["가정사역", "나눔", "연합행사", "예배", "체육"]);
  });

  it("한 항목에 같은 태그가 여러 번 붙어도 그 항목은 한 번만 센다", () => {
    // 겹친 태그까지 세면 가정사역이 3번으로 앞서지만, 실제로 붙은 항목은 1개라 2개인 연합이 앞이다
    const items = [{ tags: ["가정사역", "가정사역", "가정사역"] }, { tags: ["연합"] }, { tags: ["연합"] }];

    expect(collectTags(items)).toEqual(["연합", "가정사역"]);
  });

  it("빈 목록이면 빈 목록을 돌려준다", () => {
    expect(collectTags([])).toEqual([]);
  });
});

describe("filterByTag", () => {
  const items = [
    { title: "찬양집회", tags: ["찬양", "청년", "연합행사"] },
    { title: "봉사활동", tags: ["봉사", "연합"] },
    { title: "세미나", tags: ["가정사역"] },
    { title: "발표회", tags: ["찬양", "연합"] },
  ];
  const titles = (list: { title: string }[]) => list.map((item) => item.title);

  it("태그가 null이면 전부 원래 순서대로 돌려준다", () => {
    expect(titles(filterByTag(items, null))).toEqual(["찬양집회", "봉사활동", "세미나", "발표회"]);
  });

  it("그 태그가 붙은 항목만 원래 순서대로 남긴다", () => {
    expect(titles(filterByTag(items, "찬양"))).toEqual(["찬양집회", "발표회"]);
  });

  it("태그 이름이 정확히 같을 때만 남긴다('연합'은 '연합행사'를 잡지 않는다)", () => {
    expect(titles(filterByTag(items, "연합"))).toEqual(["봉사활동", "발표회"]);
  });

  it("어느 항목에도 없는 태그면 빈 목록을 돌려준다", () => {
    expect(filterByTag(items, "기도")).toEqual([]);
  });

  it("원래 객체를 그대로 돌려준다", () => {
    expect(filterByTag(items, "가정사역")[0]).toBe(items[2]);
  });

  it("입력 배열을 바꾸지 않는다", () => {
    const before = titles(items);

    filterByTag(items, "연합");

    expect(titles(items)).toEqual(before);
  });
});
