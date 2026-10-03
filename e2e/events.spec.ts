import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

// 행사 목록 명세. 목데이터(src/lib/mock/events.ts)를 가져오지 않고 직접 적는다.
// 행사 날짜는 요청 시각 기준 상대값이라 꼴만 확인한다. 날짜 계산은 단위 테스트(src/lib/datetime.test.ts)가 맡는다.
const UPCOMING_EVENTS = [
  { title: "청년 연합 찬양집회", church: "서연교회", tags: ["찬양", "청년", "연합행사"] },
  { title: "지역사회 연합 봉사활동", church: "한강교회", tags: ["봉사", "지역섬김", "연합"] },
  { title: "다음세대 말씀 집회", church: "드림교회", tags: ["말씀", "다음세대", "집회"] },
  { title: "가정 행복 세미나", church: "은혜교회", tags: ["가정사역", "세미나"] },
  { title: "연합 성가대 발표회", church: "샘물교회", tags: ["찬양", "연합"] },
  { title: "선교 나눔 바자회", church: "서울교회", tags: ["선교", "나눔"] },
  { title: "청소년 체육대회", church: "기쁨교회", tags: ["다음세대", "체육"] },
  { title: "연합 감사예배", church: "사랑의교회", tags: ["예배", "연합"] },
];
const PAST_EVENTS = ["지역 연합 기도회", "새가족 환영 모임"];
const EVENT_DATE_TIME = /^\d{4}\. \d{1,2}\. \d{1,2} \([일월화수목금토]\) 오[전후] \d{1,2}:\d{2}$/;

const eventList = (page: Page) => page.getByRole("region", { name: "다가오는 행사", exact: true });
const eventCards = (page: Page) =>
  eventList(page)
    .getByRole("listitem")
    .filter({ has: page.getByRole("heading", { level: 3 }) });

test.describe("행사 목록", () => {
  test("페이지 제목과 다가오는 행사 8개를 날짜순으로 교회, 일시, 태그와 함께 보여 준다", async ({ page }) => {
    await page.goto("/events");
    await expect(page.getByRole("heading", { level: 1, name: "행사", exact: true })).toBeVisible();
    await expect(eventList(page).getByText("총 8개", { exact: true })).toBeVisible();

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

  test("지난 행사는 보이지 않는다", async ({ page }) => {
    await page.goto("/events");
    // 목록이 그려진 뒤에 확인해야, 목록이 아예 없어서 통과하는 일을 막는다
    await expect(eventCards(page)).toHaveCount(UPCOMING_EVENTS.length);
    for (const title of PAST_EVENTS) {
      await expect(page.getByText(title, { exact: true })).toHaveCount(0);
    }
  });

  for (const { width, cardsPerRow } of [
    { width: 375, cardsPerRow: 1 },
    { width: 768, cardsPerRow: 2 },
    { width: 1440, cardsPerRow: 4 },
  ]) {
    test(`${width}px 폭에서 카드가 한 줄에 ${cardsPerRow}장이고 가로 스크롤이 생기지 않는다`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/events");
      const tops = await eventCards(page).evaluateAll((cards) =>
        cards.map((card) => Math.round(card.getBoundingClientRect().top)),
      );
      expect(tops).toHaveLength(UPCOMING_EVENTS.length);
      expect(tops.filter((top) => top === tops[0])).toHaveLength(cardsPerRow);

      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(overflows).toBe(false);
    });
  }
});

// 다가오는 행사의 태그. 많이 쓰인 태그(연합 3, 다음세대·찬양 2)가 앞이고, 횟수가 같으면 가나다순이다
const TAG_CHIPS = [
  "연합",
  "다음세대",
  "찬양",
  "가정사역",
  "나눔",
  "말씀",
  "봉사",
  "선교",
  "세미나",
  "연합행사",
  "예배",
  "지역섬김",
  "집회",
  "청년",
  "체육",
];
// "연합" 태그가 붙은 행사. 청년 연합 찬양집회에는 "연합행사"만 붙어 있어 빠진다
const UNION_EVENTS = ["지역사회 연합 봉사활동", "연합 성가대 발표회", "연합 감사예배"];

const tagFilter = (page: Page) => page.getByRole("navigation", { name: "태그 필터" });
const tagParam = (page: Page) => new URL(page.url()).searchParams.get("tag");

test.describe("행사 태그 필터", () => {
  test("칩이 '전체' 다음에 많이 쓰인 태그 순서로 놓이고, 처음에는 '전체'가 선택되어 있다", async ({ page }) => {
    await page.goto("/events");
    await expect(tagFilter(page).getByRole("link")).toHaveText(["전체", ...TAG_CHIPS]);
    await expect(tagFilter(page).locator('[aria-current="true"]')).toHaveText("전체");
  });

  test("'연합'을 누르면 연합 태그 행사만 남고, 주소와 개수 안내에 태그가 들어간다", async ({ page }) => {
    await page.goto("/events");
    await tagFilter(page).getByRole("link", { name: "연합", exact: true }).click();

    await expect.poll(() => tagParam(page)).toBe("연합");
    await expect(eventCards(page).getByRole("heading", { level: 3 })).toHaveText(UNION_EVENTS);
    // 고른 칩은 다시 누르면 해제되므로, 화면 읽기 프로그램에는 이름에 그 안내가 붙는다
    await expect(tagFilter(page).locator('[aria-current="true"]')).toHaveAccessibleName("연합 선택 해제");
    // 화면 읽기 프로그램이 바뀐 결과를 읽도록 개수 안내는 status 역할이다
    await expect(eventList(page).getByRole("status")).toHaveText("연합 태그 3개");
  });

  test("선택한 칩을 다시 누르면 전체로 돌아간다", async ({ page }) => {
    await page.goto(`/events?tag=${encodeURIComponent("연합")}`);
    await expect(eventCards(page)).toHaveCount(UNION_EVENTS.length);
    await tagFilter(page).getByRole("link", { name: "연합 선택 해제", exact: true }).click();

    await expect(page).toHaveURL("/events");
    await expect(eventCards(page)).toHaveCount(UPCOMING_EVENTS.length);
    await expect(tagFilter(page).locator('[aria-current="true"]')).toHaveText("전체");
    await expect(page).toHaveTitle("행사 | 함께하는 교회");
  });

  test("태그가 붙은 주소로 바로 들어와도 거른 결과를 보여 준다", async ({ page }) => {
    await page.goto(`/events?tag=${encodeURIComponent("찬양")}`);
    await expect(eventCards(page).getByRole("heading", { level: 3 })).toHaveText([
      "청년 연합 찬양집회",
      "연합 성가대 발표회",
    ]);
  });

  test("다가오는 행사에 없는 태그면 빈 안내를 보여 주고, '전체 행사 보기'로 돌아갈 수 있다", async ({ page }) => {
    // "기도"는 지난 행사(지역 연합 기도회)에만 붙은 태그라 칩에 없다
    await page.goto(`/events?tag=${encodeURIComponent("기도")}`);
    await expect(
      eventList(page).getByText("고른 태그가 붙은 다가오는 행사가 없습니다.", { exact: true }),
    ).toBeVisible();
    await expect(eventList(page).getByRole("status")).toHaveText("맞는 행사 0개");
    // 칩에 없는 태그는 주소에서 온 아무 글자일 수 있어 화면에 다시 적지 않는다
    await expect(page.locator("main")).not.toContainText("기도");
    await expect(eventCards(page)).toHaveCount(0);
    await expect(tagFilter(page).locator('[aria-current="true"]')).toHaveCount(0);

    await eventList(page).getByRole("link", { name: "전체 행사 보기", exact: true }).click();
    await expect(page).toHaveURL("/events");
    await expect(eventCards(page)).toHaveCount(UPCOMING_EVENTS.length);
  });
});
