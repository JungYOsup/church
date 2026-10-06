import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

// 헤더 버튼(알림, 프로필 메뉴) 명세. 기대값은 목데이터(src/lib/mock/*)를 가져오지 않고 직접 적는다.
const openNotifications = async (page: Page) => {
  await page.getByRole("banner").getByRole("button", { name: "알림 3개" }).click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  return menu;
};

test.describe("헤더 알림", () => {
  test("'알림 3개'를 누르면 최신 알림 5개와 '새 알림 3개'가 보인다", async ({ page }) => {
    await page.goto("/");
    const menu = await openNotifications(page);
    await expect(menu.getByText("새 알림 3개")).toBeVisible();

    const items = menu.getByRole("menuitem");
    await expect(items).toHaveCount(5);
    await expect(items.first()).toContainText("드림교회에서 새 행사를 올렸습니다: 다음세대 말씀 집회");
    await expect(items.last()).toContainText("서연교회 대표자 인증이 승인되었습니다");
    // 안 읽은 알림은 화면 읽기에서도 "새 알림"으로 시작한다
    await expect(menu.getByRole("menuitem", { name: /^새 알림/ })).toHaveCount(3);
  });

  test("새 공지 알림을 누르면 그 교회 상세로 가고 그 공지가 보인다", async ({ page }) => {
    await page.goto("/");
    const menu = await openNotifications(page);
    await menu.getByRole("menuitem", { name: /지역 연합 기도회 장소가 변경되었습니다/ }).click();
    await expect(page).toHaveURL("/churches/church-2");
    await expect(
      page.getByRole("heading", { level: 3, name: "지역 연합 기도회 장소가 변경되었습니다", exact: true }),
    ).toBeVisible();
  });

  test("인증 승인 알림을 누르면 대표자 관리로 간다", async ({ page }) => {
    await page.goto("/events");
    const menu = await openNotifications(page);
    await menu.getByRole("menuitem", { name: /대표자 인증이 승인되었습니다/ }).click();
    await expect(page).toHaveURL("/admin");
  });

  test("375px 폭에서도 알림 목록이 화면 안에 들어온다", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const menu = await openNotifications(page);
    const box = await menu.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(375);
  });
});
