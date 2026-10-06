import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

// 커뮤니티 글 명세. 목데이터(src/lib/mock/posts.ts)를 가져오지 않고 직접 적는다.
// 지난 시간은 요청 시각 기준이라 단위가 바뀌는 경계에서 10분씩 비켜 둔 값으로 적는다.
// 7일이 지난 글은 날짜로 적으므로 꼴만 확인한다. 날짜 계산은 단위 테스트(src/lib/datetime.test.ts)가 맡는다.
const POST_DATE = /^\d{4}\. \d{1,2}\. \d{1,2}$/;
const POSTS = [
  {
    title: "이번 주 지역 전도 활동을 위해 기도해주세요",
    church: "사랑의교회",
    category: "기도제목",
    time: "2시간 전",
    excerpt: "토요일 오후 동네 공원에서 전도지와 따뜻한 차를 나눕니다. 처음 나가는 청년들이 담대하게 섬길 수 있도록 기도해 주세요.",
  },
  {
    title: "청년부 연합 예배가 은혜 가운데 진행되었습니다!",
    church: "한강교회",
    category: "사역나눔",
    time: "5시간 전",
    excerpt: "다섯 교회 청년부가 함께 모여 찬양하고 말씀을 나눴습니다. 준비해 주신 교회들과 섬겨 주신 모든 분께 감사드립니다.",
  },
  {
    title: "선교지 소식과 기도편지를 나눕니다",
    church: "드림교회",
    category: "선교소식",
    time: "1일 전",
    excerpt: "현지 교회와 함께 시작한 어린이 성경학교 소식을 전합니다. 아이들이 매주 서른 명 넘게 모이고 있습니다.",
  },
  {
    title: "지역 어르신들을 위한 봉사활동 이야기",
    church: "은혜교회",
    category: "봉사후기",
    time: "1일 전",
    excerpt: "청년들과 함께 홀로 지내시는 어르신 댁을 찾아 반찬을 전하고 말벗이 되어 드렸습니다. 다음 방문에도 함께해 주세요.",
  },
  {
    title: "주일학교 교사 모집에 함께해 주세요",
    church: "기쁨교회",
    category: "사역나눔",
    time: "3일 전",
    excerpt: "아이들과 함께 말씀을 배우고 자랄 주일학교 교사를 찾습니다. 처음 섬기시는 분도 교사 교육부터 함께합니다.",
  },
  {
    title: "단기선교 준비를 위해 기도 부탁드립니다",
    church: "열매교회",
    category: "기도제목",
    time: "5일 전",
    excerpt: "청년 열두 명이 곧 떠날 단기선교를 준비하고 있습니다. 언어 공부와 건강, 현지 사역을 위해 함께 기도해 주세요.",
  },
  {
    title: "연탄 나눔 봉사 후기",
    church: "하늘빛교회",
    category: "봉사후기",
    time: POST_DATE,
    excerpt: "성도 서른 명이 언덕 위 마을에 연탄 이천 장을 날랐습니다. 끝까지 함께해 주신 모든 분께 감사드립니다.",
  },
  {
    title: "선교사님 귀국 보고 모임 소식",
    church: "생명샘교회",
    category: "선교소식",
    time: POST_DATE,
    excerpt: "선교지에서 사역하신 선교사님이 잠시 귀국해 보고 모임을 엽니다. 주일 오후 예배 뒤 본당에서 함께 모입니다.",
  },
];

const postList = (page: Page) => page.getByRole("region", { name: "글 목록", exact: true });
const postItems = (page: Page) =>
  postList(page)
    .getByRole("listitem")
    .filter({ has: page.getByRole("heading", { level: 3 }) });

test.describe("커뮤니티 글 목록", () => {
  test("페이지 제목과 글 8개를 최신순으로 분류, 지난 시간, 교회, 미리보기와 함께 보여 준다", async ({ page }) => {
    await page.goto("/community");
    await expect(page.getByRole("heading", { level: 1, name: "커뮤니티", exact: true })).toBeVisible();
    await expect(postList(page).getByRole("status")).toHaveText("총 8개");

    const items = postItems(page);
    await expect(items).toHaveCount(POSTS.length);
    for (const [index, { title, church, category, time, excerpt }] of POSTS.entries()) {
      const item = items.nth(index);
      await expect(item.getByRole("heading", { level: 3 })).toHaveText(title);
      await expect(item.getByText(category, { exact: true })).toBeVisible();
      await expect(item.getByText(excerpt, { exact: true })).toBeVisible();
      await expect(item.locator("time")).toHaveText(time);
      await expect(item).toContainText(church);
    }
  });

  for (const width of [375, 768, 1440]) {
    test(`${width}px 폭에서 글이 한 열로 놓이고 가로 스크롤이 생기지 않는다`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/community");
      const boxes = await postItems(page).evaluateAll((items) =>
        items.map((item) => {
          const { left, top } = item.getBoundingClientRect();
          return { left: Math.round(left), top: Math.round(top) };
        }),
      );
      expect(boxes).toHaveLength(POSTS.length);
      expect(new Set(boxes.map(({ left }) => left)).size, "모든 줄의 왼쪽 위치가 같다").toBe(1);
      expect(
        boxes.every(({ top }, index) => index === 0 || top > boxes[index - 1].top),
        "위에서 아래로 한 줄씩 놓인다",
      ).toBe(true);

      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(overflows).toBe(false);
    });
  }
});

// 분류 칩은 정해진 분류 순서다(많이 쓰인 순서가 아님)
const CATEGORY_CHIPS = ["기도제목", "사역나눔", "선교소식", "봉사후기"];
const PRAYER_REQUESTS = ["이번 주 지역 전도 활동을 위해 기도해주세요", "단기선교 준비를 위해 기도 부탁드립니다"];

const categoryFilter = (page: Page) => page.getByRole("navigation", { name: "분류 필터", exact: true });
const categoryParam = (page: Page) => new URL(page.url()).searchParams.get("category");

test.describe("커뮤니티 분류 필터", () => {
  test("칩이 '전체' 다음에 정해진 분류 순서로 놓이고, 처음에는 '전체'가 선택되어 있다", async ({ page }) => {
    await page.goto("/community");
    await expect(categoryFilter(page).getByRole("link")).toHaveText(["전체", ...CATEGORY_CHIPS]);
    await expect(categoryFilter(page).locator('[aria-current="true"]')).toHaveText("전체");
  });

  test("'기도제목'을 누르면 기도제목 글만 남고, 주소와 개수 안내에 분류가 들어간다", async ({ page }) => {
    await page.goto("/community");
    await categoryFilter(page).getByRole("link", { name: "기도제목", exact: true }).click();

    await expect.poll(() => categoryParam(page)).toBe("기도제목");
    await expect(postItems(page).getByRole("heading", { level: 3 })).toHaveText(PRAYER_REQUESTS);
    await expect(categoryFilter(page).locator('[aria-current="true"]')).toHaveAccessibleName("기도제목 선택 해제");
    await expect(postList(page).getByRole("status")).toHaveText("기도제목 2개");
  });

  test("선택한 칩을 다시 누르면 전체로 돌아간다", async ({ page }) => {
    await page.goto(`/community?category=${encodeURIComponent("기도제목")}`);
    await expect(postItems(page)).toHaveCount(PRAYER_REQUESTS.length);
    await categoryFilter(page).getByRole("link", { name: "기도제목 선택 해제", exact: true }).click();

    await expect(page).toHaveURL("/community");
    await expect(postItems(page)).toHaveCount(POSTS.length);
    await expect(categoryFilter(page).locator('[aria-current="true"]')).toHaveText("전체");
    await expect(page).toHaveTitle("커뮤니티 | 함께하는 교회");
  });

  test("분류가 붙은 주소로 바로 들어와도 거른 결과를 보여 준다", async ({ page }) => {
    await page.goto(`/community?category=${encodeURIComponent("봉사후기")}`);
    await expect(postItems(page).getByRole("heading", { level: 3 })).toHaveText([
      "지역 어르신들을 위한 봉사활동 이야기",
      "연탄 나눔 봉사 후기",
    ]);
  });

  test("글에 없는 분류면 빈 안내를 보여 주고, '전체 글 보기'로 돌아갈 수 있다", async ({ page }) => {
    // "일정변경"은 공지의 분류라 커뮤니티 칩에 없다
    await page.goto(`/community?category=${encodeURIComponent("일정변경")}`);
    await expect(postList(page).getByText("고른 분류의 글이 없습니다.", { exact: true })).toBeVisible();
    await expect(postList(page).getByRole("status")).toHaveText("맞는 글 0개");
    // 칩에 없는 분류는 주소에서 온 아무 글자일 수 있어 화면에 다시 적지 않는다
    await expect(page.locator("main")).not.toContainText("일정변경");
    await expect(postItems(page)).toHaveCount(0);
    await expect(categoryFilter(page).locator('[aria-current="true"]')).toHaveCount(0);

    await postList(page).getByRole("link", { name: "전체 글 보기", exact: true }).click();
    await expect(page).toHaveURL("/community");
    await expect(postItems(page)).toHaveCount(POSTS.length);
  });
});
