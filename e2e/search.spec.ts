import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

// 통합 검색 명세. 기대값은 목데이터(src/lib/mock/*)를 가져오지 않고 직접 적는다.
const searchPath = (query: string) => `/search?q=${encodeURIComponent(query)}`;
const searchBox = (page: Page) => page.getByRole("searchbox", { name: "검색어" });
const group = (page: Page, name: string) => page.getByRole("region", { name, exact: true });

test.describe("통합 검색 입구", () => {
  test("헤더의 '검색'을 누르면 검색 페이지로 가고 검색창에 포커스가 간다", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("banner").getByRole("link", { name: "검색", exact: true }).click();
    await expect(page).toHaveURL("/search");
    await expect(searchBox(page)).toBeFocused();
  });

  test("검색어 없이 들어오면 무엇으로 찾을 수 있는지 안내하고, 탭 제목은 '검색'이다", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByRole("heading", { level: 1, name: "검색" })).toBeVisible();
    await expect(page).toHaveTitle("검색 | 함께하는 교회");
    await expect(page.getByText("교회 이름, 지역, 목사님 이름이나 행사·공지·글 제목으로 찾아보세요.")).toBeVisible();
    await expect(page.getByRole("region")).toHaveCount(0);
  });

  test("공백뿐인 검색어는 검색어 없이 들어온 것과 같다", async ({ page }) => {
    await page.goto(searchPath("   "));
    await expect(page.getByText("교회 이름, 지역, 목사님 이름이나 행사·공지·글 제목으로 찾아보세요.")).toBeVisible();
    await expect(page.getByRole("status")).toHaveText("");
    await expect(searchBox(page)).toBeFocused();
  });

  test("결과 화면에서 헤더 '검색'으로 다시 오면 입력칸이 비어 있다", async ({ page }) => {
    await page.goto(searchPath("서연"));
    await expect(searchBox(page)).toHaveValue("서연");
    await page.getByRole("banner").getByRole("link", { name: "검색", exact: true }).click();
    await expect(page).toHaveURL("/search");
    await expect(searchBox(page)).toHaveValue("");
  });
});

test.describe("통합 검색 결과", () => {
  test("검색어를 넣고 Enter를 누르면 주소에 검색어가 붙고 묶음별로 결과가 나온다", async ({ page }) => {
    await page.goto("/search");
    await searchBox(page).fill("서연");
    await searchBox(page).press("Enter");
    await expect(page).toHaveURL((url) => url.pathname === "/search" && url.searchParams.get("q") === "서연");

    await expect(page.getByRole("status")).toHaveText("검색 결과 3개");
    await expect(group(page, "교회").getByRole("link", { name: "서연교회", exact: true })).toBeVisible();
    await expect(group(page, "행사").getByRole("heading", { level: 3 })).toHaveText(["청년 연합 찬양집회"]);
    await expect(group(page, "공지").getByRole("heading", { level: 3 })).toHaveText([
      "특별새벽기도회에 여러분을 초대합니다",
    ]);
    // 결과가 없는 묶음은 보이지 않는다
    await expect(group(page, "커뮤니티 글")).toHaveCount(0);
  });

  test("결과의 교회를 누르면 그 교회 상세로 간다", async ({ page }) => {
    await page.goto(searchPath("서연"));
    await group(page, "교회").getByRole("link", { name: "서연교회", exact: true }).click();
    await expect(page).toHaveURL("/churches/church-1");
  });

  test("낱말이 여러 개면 모두 들어 있는 것만 찾는다", async ({ page }) => {
    await page.goto(searchPath("청년 찬양"));
    await expect(group(page, "행사").getByRole("heading", { level: 3 })).toHaveText(["청년 연합 찬양집회"]);
  });

  test("지난 행사는 찾지 않는다", async ({ page }) => {
    // "지역 연합 기도회"는 사흘 전에 끝난 행사다. 같은 이름의 공지(장소 변경)만 나와야 한다
    await page.goto(searchPath("지역 연합 기도회"));
    await expect(group(page, "공지").getByRole("heading", { level: 3 })).toHaveText([
      "지역 연합 기도회 장소가 변경되었습니다",
    ]);
    await expect(group(page, "행사")).toHaveCount(0);
  });

  test("맞는 것이 없으면 빈 안내를 보여 준다", async ({ page }) => {
    await page.goto(searchPath("없는검색어"));
    await expect(page.getByRole("status")).toHaveText("검색 결과 0개");
    await expect(page.getByText("맞는 결과가 없습니다.")).toBeVisible();
    await expect(page.getByRole("region")).toHaveCount(0);
  });

  test("주소의 검색어는 입력칸에만 두고 화면 글로 다시 적지 않는다", async ({ page }) => {
    const injected = "공식안내문구";
    await page.goto(searchPath(injected));
    await expect(searchBox(page)).toHaveValue(injected);
    await expect(page.getByText(injected)).toHaveCount(0);
  });

  for (const width of [375, 768, 1440]) {
    test(`${width}px 폭에서 가로 스크롤이 생기지 않는다`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(searchPath("서울"));
      await expect(group(page, "교회")).toBeVisible();
      const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflows).toBe(false);
    });
  }
});
