import type { Page } from "@playwright/test";
import { expect, fakeMapCenter, fakeMapLevel, test } from "./fixtures";

// 교회 상세 명세. 목데이터(src/lib/mock/churches.ts 등)를 가져오지 않고 직접 적는다.
const SEOYEON = {
  path: "/churches/church-1",
  name: "서연교회",
  slogan: "지역과 함께하는, 다음 세대를 세우는 교회",
  pastor: "김성민 목사",
  area: "서울 용산구",
  address: "서울특별시 용산구 이태원동",
  members: "530명",
  tags: ["다음세대", "지역섬김", "예배"],
};

test.describe("교회 상세 소개", () => {
  test("교회 이름, 탭 제목, 소개, 교회 정보, 태그를 보여 준다", async ({ page }) => {
    await page.goto(SEOYEON.path);
    await expect(page.getByRole("heading", { level: 1, name: SEOYEON.name, exact: true })).toBeVisible();
    await expect(page).toHaveTitle(`${SEOYEON.name} | 함께하는 교회`);
    await expect(page.getByText(SEOYEON.slogan, { exact: true })).toBeVisible();

    const info = page.getByRole("region", { name: "교회 정보", exact: true });
    for (const text of [SEOYEON.pastor, SEOYEON.area, SEOYEON.address, SEOYEON.members]) {
      await expect(info, text).toContainText(text);
    }
    // 태그는 교회 이름이 있는 머리 안에서만 찾는다. 행사 카드에도 태그가 있어 페이지 전체에서 찾으면 겹친다
    const intro = page.getByRole("heading", { level: 1, name: SEOYEON.name, exact: true }).locator("..");
    await expect(intro.getByRole("listitem")).toHaveText(SEOYEON.tags);
  });

  test("없는 교회면 404를 돌려준다", async ({ page, consoleErrors }) => {
    const response = await page.goto("/churches/church-99");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();

    // 404 응답은 브라우저가 콘솔에 오류로 남긴다. 이 테스트에서만 예상된 오류라 그 한 줄만 확인하고 뺀다
    const notFoundLogs = consoleErrors.filter((message) => message.includes("status of 404"));
    expect(notFoundLogs).toHaveLength(1);
    consoleErrors.splice(consoleErrors.indexOf(notFoundLogs[0]), 1);
  });

  for (const width of [375, 768, 1440]) {
    test(`${width}px 폭에서 가로 스크롤이 생기지 않는다`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(SEOYEON.path);
      await expect(page.getByRole("heading", { level: 1, name: SEOYEON.name, exact: true })).toBeVisible();
      const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflows).toBe(false);
    });
  }
});

test.describe("교회 상세 행사·공지", () => {
  const section = (page: Page, name: string) =>
    page.getByRole("region", { name, exact: true });

  test("그 교회의 다가오는 행사와 공지만 보여 준다", async ({ page }) => {
    await page.goto(SEOYEON.path);
    await expect(section(page, "다가오는 행사").getByRole("heading", { level: 3 })).toHaveText(["청년 연합 찬양집회"]);
    await expect(section(page, "공지").getByRole("heading", { level: 3 })).toHaveText([
      "특별새벽기도회에 여러분을 초대합니다",
    ]);
  });

  test("행사와 공지가 없으면 빈 안내를 보여 준다", async ({ page }) => {
    await page.goto("/churches/church-7");
    await expect(page.getByRole("heading", { level: 1, name: "빛과소금교회", exact: true })).toBeVisible();
    await expect(section(page, "다가오는 행사")).toContainText("다가오는 행사가 없습니다.");
    await expect(section(page, "다가오는 행사").getByRole("heading", { level: 3 })).toHaveCount(0);
    await expect(section(page, "공지")).toContainText("올린 공지가 없습니다.");
    await expect(section(page, "공지").getByRole("heading", { level: 3 })).toHaveCount(0);
  });
});

test.describe("교회 상세 지도", () => {
  const location = (page: Page) => page.getByRole("region", { name: "위치", exact: true });

  test("지도를 쓸 수 없으면 대체 화면을 보여 주고, 교회 지도로 가는 링크가 있다", async ({ page }) => {
    await page.goto(SEOYEON.path);
    await expect(location(page)).toContainText("지도를 표시할 수 없습니다");
    await location(page).getByRole("link", { name: "교회 지도에서 보기", exact: true }).click();
    await expect(page).toHaveURL(/\/map\?region=/);
    expect(new URL(page.url()).searchParams.get("region")).toBe("서울");
  });

  test.describe("SDK를 불러오면", () => {
    test.use({ kakaoSdk: "fake" });

    test("그 교회 핀 하나를 꽂고, 그 교회를 가운데 두고 동네가 보이게 맞춘다", async ({ page }) => {
      await page.goto(SEOYEON.path);
      const map = location(page).getByRole("region", { name: "지도", exact: true });
      await expect(map.getByRole("img", { name: SEOYEON.name, exact: true })).toHaveCount(1);
      await expect.poll(() => fakeMapLevel(page)).toBe(4);
      expect(await fakeMapCenter(page)).toEqual({ lat: 37.5326, lng: 126.9905 });
    });
  });
});
