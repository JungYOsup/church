import type { Page } from "@playwright/test";
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

// 홈 세 번째 행 명세. 목데이터(src/lib/mock/events.ts 등)를 가져오지 않고 직접 적는다.
// 행사 날짜는 빌드 시각 기준 상대값이라 꼴만 확인한다. 날짜 계산은 단위 테스트(src/lib/datetime.test.ts)가 맡는다.
const UPCOMING_EVENTS = [
  { title: "청년 연합 찬양집회", church: "서연교회", tags: ["찬양", "청년", "연합행사"] },
  { title: "지역사회 연합 봉사활동", church: "한강교회", tags: ["봉사", "지역섬김", "연합"] },
  { title: "다음세대 말씀 집회", church: "드림교회", tags: ["말씀", "다음세대", "집회"] },
  { title: "가정 행복 세미나", church: "은혜교회", tags: ["가정사역", "세미나"] },
  { title: "연합 성가대 발표회", church: "샘물교회", tags: ["찬양", "연합"] },
  { title: "선교 나눔 바자회", church: "서울교회", tags: ["선교", "나눔"] },
];
// 지난 행사 두 개와, 다가오지만 일곱 번째라 홈에 들어가지 않는 행사
const HIDDEN_EVENTS = ["지역 연합 기도회", "새가족 환영 모임", "청소년 체육대회"];
const EVENT_DATE_TIME = /^\d{4}\. \d{1,2}\. \d{1,2} \([일월화수목금토]\) 오[전후] \d{1,2}:\d{2}$/;

test.describe("홈 다가오는 행사", () => {
  const eventCards = (page: Page) =>
    page
      .getByRole("region", { name: "다가오는 행사", exact: true })
      .getByRole("listitem")
      .filter({ has: page.getByRole("heading", { level: 3 }) });

  test("다가오는 행사 6개를 날짜순으로 교회, 일시, 태그와 함께 보여 준다", async ({ page }) => {
    await page.goto("/");
    const cards = eventCards(page);
    await expect(cards).toHaveCount(UPCOMING_EVENTS.length);
    for (const [index, { title, church, tags }] of UPCOMING_EVENTS.entries()) {
      const card = cards.nth(index);
      await expect(card.getByRole("heading", { level: 3 })).toHaveText(title);
      await expect(card).toContainText(church);
      await expect(card.locator("time")).toHaveText(EVENT_DATE_TIME);
      await expect(card.getByRole("list").getByRole("listitem")).toHaveText(tags);
    }
  });

  test("지난 행사와 일곱 번째 이후 행사는 보이지 않는다", async ({ page }) => {
    await page.goto("/");
    // 칸이 그려진 뒤에 확인해야, 칸이 아예 없어서 통과하는 일을 막는다
    await expect(eventCards(page)).toHaveCount(UPCOMING_EVENTS.length);
    const region = page.getByRole("region", { name: "다가오는 행사", exact: true });
    for (const title of HIDDEN_EVENTS) {
      await expect(region.getByText(title, { exact: true })).toHaveCount(0);
    }
  });

  test("'더보기'를 누르면 행사 페이지로 이동한다", async ({ page }) => {
    await page.goto("/");
    const region = page.getByRole("region", { name: "다가오는 행사", exact: true });
    await region.getByRole("link", { name: "더보기" }).click();
    await expect(page).toHaveURL("/events");
  });

  test("1440px에서 '다음 행사'를 누르면 목록이 끝까지 넘어가고 버튼 상태가 바뀐다", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const region = page.getByRole("region", { name: "다가오는 행사", exact: true });
    const previous = region.getByRole("button", { name: "이전 행사" });
    const next = region.getByRole("button", { name: "다음 행사" });
    await expect(previous).toBeDisabled();
    await expect(next).toBeEnabled();

    const firstCard = eventCards(page).first();
    const startX = (await firstCard.boundingBox())!.x;
    await next.click();
    await expect.poll(async () => (await firstCard.boundingBox())!.x).toBeLessThan(startX);
    // 한 번에 세 장씩 넘어가서 여섯 장이면 한 번에 끝에 닿는다
    await expect(next).toBeDisabled();
    await expect(previous).toBeEnabled();
  });
});

const RECENT_NOTICES = [
  { title: "특별새벽기도회에 여러분을 초대합니다", church: "서연교회", category: "행사안내" },
  { title: "지역 연합 기도회 장소가 변경되었습니다", church: "한강교회", category: "일정변경" },
  { title: "다음세대 수련회 등록 안내", church: "드림교회", category: "모집안내" },
  { title: "교회 주차장 이용 안내", church: "은혜교회", category: "일반공지" },
];
const NOTICE_DATE = /^\d{4}\. \d{1,2}\. \d{1,2}$/;

const RECENT_POSTS = [
  { title: "이번 주 지역 전도 활동을 위해 기도해주세요", church: "사랑의교회", category: "기도제목", time: "2시간 전" },
  { title: "청년부 연합 예배가 은혜 가운데 진행되었습니다!", church: "한강교회", category: "사역나눔", time: "5시간 전" },
  { title: "선교지 소식과 기도편지를 나눕니다", church: "드림교회", category: "선교소식", time: "1일 전" },
  { title: "지역 어르신들을 위한 봉사활동 이야기", church: "은혜교회", category: "봉사후기", time: "1일 전" },
];

test.describe("홈 최근 공지", () => {
  test("최근 공지 4개를 최신순으로 날짜, 교회, 분류와 함께 보여 준다", async ({ page }) => {
    await page.goto("/");
    const items = page.getByRole("region", { name: "최근 공지", exact: true }).getByRole("listitem");
    await expect(items).toHaveCount(RECENT_NOTICES.length);
    for (const [index, { title, church, category }] of RECENT_NOTICES.entries()) {
      const item = items.nth(index);
      await expect(item).toContainText(title);
      await expect(item).toContainText(church);
      await expect(item.locator("time")).toHaveText(NOTICE_DATE);
      await expect(item.getByText(category, { exact: true })).toBeVisible();
    }
  });

  test("'더보기'를 누르면 공지 페이지로 이동한다", async ({ page }) => {
    await page.goto("/");
    const region = page.getByRole("region", { name: "최근 공지", exact: true });
    await region.getByRole("link", { name: "더보기" }).click();
    await expect(page).toHaveURL("/notices");
  });
});

test.describe("홈 커뮤니티 최신 글", () => {
  test("최신 글 4개를 교회, 지난 시간, 분류와 함께 보여 준다", async ({ page }) => {
    await page.goto("/");
    const items = page.getByRole("region", { name: "커뮤니티 최신 글", exact: true }).getByRole("listitem");
    await expect(items).toHaveCount(RECENT_POSTS.length);
    for (const [index, { title, church, category, time }] of RECENT_POSTS.entries()) {
      const item = items.nth(index);
      await expect(item).toContainText(title);
      await expect(item).toContainText(church);
      await expect(item.locator("time")).toHaveText(time);
      await expect(item.getByText(category, { exact: true })).toBeVisible();
    }
  });

  test("'더보기'를 누르면 커뮤니티 페이지로 이동한다", async ({ page }) => {
    await page.goto("/");
    const region = page.getByRole("region", { name: "커뮤니티 최신 글", exact: true });
    await region.getByRole("link", { name: "더보기" }).click();
    await expect(page).toHaveURL("/community");
  });
});

const THIRD_ROW_SECTIONS = ["다가오는 행사", "최근 공지", "커뮤니티 최신 글"];

test.describe("홈 세 번째 행 배치", () => {
  for (const { width, layout, description } of [
    { width: 375, layout: "stacked", description: "세 칸이 위아래로 놓인다" },
    { width: 768, layout: "events-above-pair", description: "행사 아래에 공지와 커뮤니티가 나란히 놓인다" },
    { width: 1440, layout: "one-row", description: "세 칸이 한 줄에 놓인다" },
  ] as const) {
    test(`${width}px 폭에서 ${description}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const boxes = [];
      for (const name of THIRD_ROW_SECTIONS) {
        const box = await page.getByRole("region", { name, exact: true }).boundingBox();
        expect(box, `${name} 칸`).not.toBeNull();
        boxes.push(box!);
      }
      const [events, notices, community] = boxes;
      if (layout === "stacked") {
        expect(events.y < notices.y && notices.y < community.y, "위에서부터 행사 → 공지 → 커뮤니티").toBe(true);
      } else if (layout === "events-above-pair") {
        expect(events.y < notices.y, "행사가 위").toBe(true);
        expect(Math.round(notices.y)).toBe(Math.round(community.y));
        expect(notices.x < community.x, "왼쪽부터 공지 → 커뮤니티").toBe(true);
      } else {
        expect([notices.y, community.y].map(Math.round)).toEqual([Math.round(events.y), Math.round(events.y)]);
        expect(events.x < notices.x && notices.x < community.x, "왼쪽부터 행사 → 공지 → 커뮤니티").toBe(true);
      }
    });
  }
});
