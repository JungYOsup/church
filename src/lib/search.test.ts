import { describe, expect, it } from "vitest";
import { MAX_QUERY_LENGTH, matchesQuery, toSearchTerms } from "@/lib/search";

describe("toSearchTerms", () => {
  it("띄어쓰기로 낱말을 나누고 앞뒤·겹친 공백은 버린다", () => {
    expect(toSearchTerms("  청년   찬양 ")).toEqual(["청년", "찬양"]);
  });

  it("탭·줄바꿈도 띄어쓰기로 본다", () => {
    expect(toSearchTerms("청년\t찬양\n집회")).toEqual(["청년", "찬양", "집회"]);
  });

  it("영문은 소문자로 바꾼다", () => {
    expect(toSearchTerms("Youth CAMP")).toEqual(["youth", "camp"]);
  });

  it(`앞뒤 공백을 뺀 검색어가 ${MAX_QUERY_LENGTH}자를 넘으면 넘는 부분을 버린다`, () => {
    const query = ` ${"가".repeat(MAX_QUERY_LENGTH)}나다 `;

    expect(toSearchTerms(query)).toEqual(["가".repeat(MAX_QUERY_LENGTH)]);
  });

  it("빈 검색어나 공백뿐인 검색어는 낱말이 없다", () => {
    expect(toSearchTerms("")).toEqual([]);
    expect(toSearchTerms("   ")).toEqual([]);
  });
});

describe("matchesQuery", () => {
  const church = ["서연교회", "함께 성장하는 공동체", "서울 용산구", "청년"];

  it("칸의 일부만 맞아도 맞는다", () => {
    expect(matchesQuery(church, ["서연"])).toBe(true);
  });

  it("낱말이 여러 개면 모두 들어 있어야 맞는다. 낱말이 서로 다른 칸에 있어도 된다", () => {
    expect(matchesQuery(church, ["서연", "용산구"])).toBe(true);
  });

  it("낱말 하나라도 없으면 안 맞는다", () => {
    expect(matchesQuery(church, ["서연", "성남시"])).toBe(false);
  });

  it("두 칸에 걸친 글자는 맞지 않는다", () => {
    // 칸을 이어 붙여 찾으면 "공동체서울"이 맞아 버린다
    expect(matchesQuery(church, ["공동체서울"])).toBe(false);
  });

  it("영문은 대소문자를 가리지 않는다", () => {
    expect(matchesQuery(["Youth Camp"], toSearchTerms("youth"))).toBe(true);
    expect(matchesQuery(["youth camp"], toSearchTerms("CAMP"))).toBe(true);
  });

  it("낱말이 없으면 아무것도 맞지 않는다", () => {
    expect(matchesQuery(church, [])).toBe(false);
  });
});
