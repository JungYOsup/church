import { expect, test } from "./fixtures";

// 메뉴 명세. src/lib/navigation.ts를 가져오지 않고 직접 적어서, 메뉴가 실수로 바뀌면 테스트가 잡아낸다.
const MENU = [
  { label: "홈", path: "/" },
  { label: "교회 지도", path: "/map" },
  { label: "행사", path: "/events" },
  { label: "공지", path: "/notices" },
  { label: "커뮤니티", path: "/community" },
  { label: "대표자 관리", path: "/admin" },
];

test.describe("데스크톱 메뉴 (1440px)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const { label, path } of MENU) {
    test(`'${label}'을 누르면 ${path}로 이동하고 현재 메뉴로 표시된다`, async ({ page }) => {
      await page.goto(path === "/" ? "/events" : "/");
      const nav = page.getByRole("navigation", { name: "주 메뉴" });
      await nav.getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(path);
      await expect(nav.locator('[aria-current="page"]')).toHaveText(label);
    });
  }

  test("하위 페이지의 탭 제목에 사이트 이름이 붙는다", async ({ page }) => {
    await page.goto("/events");
    await expect(page).toHaveTitle("행사 | 함께하는 교회");
  });
});

test.describe("모바일 메뉴 (375px)", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("데스크톱 메뉴 대신 메뉴 열기 버튼이 보인다", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "주 메뉴" })).toBeHidden();
    await expect(page.getByRole("button", { name: "메뉴 열기" })).toBeVisible();
  });

  test("메뉴에서 '공지'를 누르면 이동하고 메뉴가 닫힌다", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "메뉴 열기" }).click();
    const sheet = page.getByRole("dialog");
    await sheet.getByRole("link", { name: "공지", exact: true }).click();
    await expect(page).toHaveURL("/notices");
    await expect(sheet).toBeHidden();
  });

  test("메뉴를 다시 열면 현재 페이지가 현재 메뉴로 표시된다", async ({ page }) => {
    await page.goto("/notices");
    await page.getByRole("button", { name: "메뉴 열기" }).click();
    await expect(page.getByRole("dialog").locator('[aria-current="page"]')).toHaveText("공지");
  });
});
