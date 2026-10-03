import { describe, expect, it } from "vitest";
import { parseSearchParam } from "@/lib/search-params";

describe("parseSearchParam", () => {
  it("값이 없거나 비어 있으면 null을 돌려준다", () => {
    expect(parseSearchParam(undefined)).toBeNull();
    expect(parseSearchParam("")).toBeNull();
  });

  it("문자열은 그대로 돌려준다", () => {
    expect(parseSearchParam("연합")).toBe("연합");
  });

  it("같은 이름이 여러 번 오면(?tag=a&tag=b) 첫 값을 돌려준다", () => {
    expect(parseSearchParam(["찬양", "연합"])).toBe("찬양");
    expect(parseSearchParam([])).toBeNull();
  });
});
