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

// 통계 카드 명세. 목데이터(src/lib/mock/stats.ts)를 가져오지 않고 직접 적어서, 숫자가 실수로 바뀌면 테스트가 잡아낸다.
const STAT_CARDS = [
  {
    label: "등록 교회",
    value: "248",
    description: "전국 17개 지역의 교회가 함께하고 있습니다.",
    path: "/map",
  },
  {
    label: "이번 주 행사",
    value: "32",
    description: "이번 주에 진행되는 교회 행사입니다.",
    path: "/events",
  },
  {
    label: "공유 공지",
    value: "87",
    description: "교회들의 다양한 소식을 확인해보세요.",
    path: "/notices",
  },
  {
    label: "대표자 인증",
    value: "146",
    description: "공식 인증된 교회 대표자 수입니다.",
    path: "/admin",
  },
];

test.describe("홈 통계 카드", () => {
  test("카드 4개가 이름, 숫자, 설명을 순서대로 보여 준다", async ({ page }) => {
    await page.goto("/");
    const cards = page.getByRole("region", { name: "교회 연합 현황" }).getByRole("link");
    await expect(cards).toHaveCount(STAT_CARDS.length);
    for (const [index, { label, value, description }] of STAT_CARDS.entries()) {
      await expect(cards.nth(index)).toHaveText(new RegExp(`^${label}\\s*${value}\\D`));
      await expect(cards.nth(index)).toContainText(description);
    }
  });

  for (const { label, path } of STAT_CARDS) {
    test(`'${label}' 카드를 누르면 ${path}로 이동한다`, async ({ page }) => {
      await page.goto("/");
      const region = page.getByRole("region", { name: "교회 연합 현황" });
      await region.getByRole("link", { name: new RegExp(`^${label}`) }).click();
      await expect(page).toHaveURL(path);
    });
  }

  for (const { width, columns } of [
    { width: 375, columns: 1 },
    { width: 768, columns: 2 },
    { width: 1440, columns: 4 },
  ]) {
    test(`${width}px 폭에서 카드가 한 줄에 ${columns}개 놓인다`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const tops = await page
        .getByRole("region", { name: "교회 연합 현황" })
        .getByRole("link")
        .evaluateAll((cards) => cards.map((card) => Math.round(card.getBoundingClientRect().top)));
      expect(tops).toHaveLength(STAT_CARDS.length);
      expect(tops.filter((top) => top === tops[0])).toHaveLength(columns);
    });
  }
});
