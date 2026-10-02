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
    // 이름은 기본이 부분 일치라, 아래 행의 "우리 교회 등록하기"처럼 이름이 겹치는 링크가 생기면 둘 다 잡힌다
    await page.getByRole("link", { name: "교회 찾기", exact: true }).click();
    await expect(page).toHaveURL("/map");
  });

  test("'우리 교회 등록'을 누르면 대표자 관리 페이지로 이동한다", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "우리 교회 등록", exact: true }).click();
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

// 홈 두 번째 행 명세. 목데이터(src/lib/mock/churches.ts)를 가져오지 않고 직접 적는다.
const ROW_SECTIONS = [
  "우리 지역 교회 지도",
  "추천 교회",
  "우리 교회를 등록하고 더 많은 성도들과 연결하세요",
];

const RECOMMENDED_CHURCHES = [
  {
    name: "서연교회",
    area: "서울 용산구",
    pastor: "김성민 목사",
    members: "530명",
    tags: ["다음세대", "지역섬김", "예배"],
  },
  {
    name: "한강교회",
    area: "서울 마포구",
    pastor: "이준혁 목사",
    members: "420명",
    tags: ["말씀중심", "청년사역", "지역봉사"],
  },
  {
    name: "은혜교회",
    area: "경기 성남시",
    pastor: "박지현 목사",
    members: "380명",
    tags: ["가정사역", "선교", "찬양"],
  },
];

const REP_BENEFITS = [
  "교회 정보와 사역을 소개할 수 있습니다.",
  "교회 행사와 소식을 공유할 수 있습니다.",
  "지역의 다른 교회와 협력할 수 있습니다.",
];

test.describe("홈 추천 교회", () => {
  test("카드 3장이 이름, 지역, 목사, 인원, 태그를 순서대로 보여 준다", async ({ page }) => {
    await page.goto("/");
    const region = page.getByRole("region", { name: "추천 교회", exact: true });
    const cards = region.getByRole("listitem").filter({ has: page.getByRole("heading", { level: 3 }) });
    await expect(cards).toHaveCount(RECOMMENDED_CHURCHES.length);
    for (const [index, { name, area, pastor, members, tags }] of RECOMMENDED_CHURCHES.entries()) {
      const card = cards.nth(index);
      await expect(card.getByRole("heading", { level: 3 })).toHaveText(name);
      await expect(card).toContainText(area);
      await expect(card).toContainText(pastor);
      await expect(card).toContainText(members);
      await expect(card.getByRole("list").getByRole("listitem")).toHaveText(tags);
    }
  });

  test("하트를 누르면 관심 교회로 표시되고, 다시 누르면 풀린다", async ({ page }) => {
    await page.goto("/");
    const heart = page.getByRole("button", { name: "서연교회 관심 교회" });
    await expect(heart).toHaveAttribute("aria-pressed", "false");
    await heart.click();
    await expect(heart).toHaveAttribute("aria-pressed", "true");
    await heart.click();
    await expect(heart).toHaveAttribute("aria-pressed", "false");
  });

  test("'더보기'를 누르면 교회 지도 페이지로 이동한다", async ({ page }) => {
    await page.goto("/");
    const region = page.getByRole("region", { name: "추천 교회", exact: true });
    await region.getByRole("link", { name: "더보기" }).click();
    await expect(page).toHaveURL("/map");
  });
});

test.describe("홈 교회 지도 칸", () => {
  // 카카오맵 키가 없는 지금은 항상 대체 화면이다. 지도를 붙이는 작업에서 키가 있을 때의 검사를 더한다.
  test("지도를 띄울 수 없으면 대체 화면을 보여 준다", async ({ page }) => {
    await page.goto("/");
    const region = page.getByRole("region", { name: "우리 지역 교회 지도", exact: true });
    await expect(region).toContainText("지도를 표시할 수 없습니다");
  });

  test("'전체 지도 보기'를 누르면 교회 지도 페이지로 이동한다", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "전체 지도 보기" }).click();
    await expect(page).toHaveURL("/map");
  });
});

test.describe("홈 대표자 등록 안내", () => {
  test("대표자가 할 수 있는 일 3가지를 보여 준다", async ({ page }) => {
    await page.goto("/");
    const region = page.getByRole("region", { name: ROW_SECTIONS[2], exact: true });
    await expect(region.getByRole("listitem")).toHaveText(REP_BENEFITS);
  });

  test("'우리 교회 등록하기'를 누르면 대표자 관리 페이지로 이동한다", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "우리 교회 등록하기", exact: true }).click();
    await expect(page).toHaveURL("/admin");
  });
});

test.describe("홈 두 번째 행 배치", () => {
  for (const { width, oneRow, cardsPerRow } of [
    { width: 375, oneRow: false, cardsPerRow: 1 },
    { width: 768, oneRow: false, cardsPerRow: 3 },
    { width: 1440, oneRow: true, cardsPerRow: 3 },
  ]) {
    test(`${width}px 폭에서 세 칸이 ${oneRow ? "한 줄에" : "위아래로"} 놓이고 추천 카드는 한 줄에 ${cardsPerRow}장`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const boxes = [];
      for (const name of ROW_SECTIONS) {
        const box = await page.getByRole("region", { name, exact: true }).boundingBox();
        expect(box, `${name} 칸`).not.toBeNull();
        boxes.push(box!);
      }
      const [map, recommended, cta] = boxes;
      if (oneRow) {
        expect([recommended.y, cta.y].map(Math.round)).toEqual([Math.round(map.y), Math.round(map.y)]);
        expect(map.x < recommended.x && recommended.x < cta.x, "왼쪽부터 지도 → 추천 → 안내").toBe(true);
      } else {
        expect(map.y < recommended.y && recommended.y < cta.y, "위에서부터 지도 → 추천 → 안내").toBe(true);
      }

      const tops = await page
        .getByRole("region", { name: "추천 교회", exact: true })
        .getByRole("listitem")
        .filter({ has: page.getByRole("heading", { level: 3 }) })
        .evaluateAll((cards) => cards.map((card) => Math.round(card.getBoundingClientRect().top)));
      expect(tops).toHaveLength(RECOMMENDED_CHURCHES.length);
      expect(tops.filter((top) => top === tops[0])).toHaveLength(cardsPerRow);
    });
  }
});
