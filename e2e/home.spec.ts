import { expect, test } from "./fixtures";

test.describe("홈 레이아웃", () => {
  for (const width of [375, 768, 1440]) {
    test(`${width}px 폭에서 가로 스크롤이 생기지 않는다`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(overflows).toBe(false);
    });
  }

  test("본문에 Pretendard 폰트가 적용된다", async ({ page }) => {
    await page.goto("/");
    const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    expect(fontFamily).toMatch(/pretendard/i);
  });
});

test.describe("홈 히어로 버튼", () => {
  test("'교회 찾기'를 누르면 교회 지도 페이지로 이동한다", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "교회 찾기" }).click();
    await expect(page).toHaveURL("/map");
  });

  test("'우리 교회 등록'을 누르면 대표자 관리 페이지로 이동한다", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "우리 교회 등록" }).click();
    await expect(page).toHaveURL("/admin");
  });
});
