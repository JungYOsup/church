import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

// 공지 목록 명세. 목데이터(src/lib/mock/notices.ts)를 가져오지 않고 직접 적는다.
// 게시 날짜는 요청 시각 기준 상대값이라 꼴만 확인한다. 날짜 계산은 단위 테스트(src/lib/datetime.test.ts)가 맡는다.
const NOTICES = [
  {
    title: "특별새벽기도회에 여러분을 초대합니다",
    church: "서연교회",
    category: "행사안내",
    summary: "한 주 동안 새벽 5시 30분에 본당에서 함께 기도합니다. 이웃 교회 성도님도 누구나 오실 수 있습니다.",
  },
  {
    title: "지역 연합 기도회 장소가 변경되었습니다",
    church: "한강교회",
    category: "일정변경",
    summary: "참석 인원이 늘어 장소를 본당에서 교육관 2층 대강당으로 옮깁니다. 모이는 시간은 그대로입니다.",
  },
  {
    title: "다음세대 수련회 등록 안내",
    church: "드림교회",
    category: "모집안내",
    summary: "중고등부 수련회 참가 신청을 받습니다. 교회 사무실이나 담당 교역자에게 신청해 주세요.",
  },
  {
    title: "교회 주차장 이용 안내",
    church: "은혜교회",
    category: "일반공지",
    summary: "주일 오전에는 주차장이 붐비니 가까운 공영주차장을 이용해 주세요. 어르신과 장애인 차량은 먼저 안내합니다.",
  },
  {
    title: "연합 찬양제 참가팀 모집",
    church: "샘물교회",
    category: "모집안내",
    summary: "지역 교회 찬양팀이 함께 서는 연합 찬양제에 참가할 팀을 모집합니다. 팀마다 두 곡을 준비해 주세요.",
  },
  {
    title: "주일 예배 시간 변경 안내",
    church: "서울교회",
    category: "일정변경",
    summary: "다음 주일부터 2부 예배가 오전 11시에서 11시 30분으로 바뀝니다. 1부와 3부는 그대로입니다.",
  },
  {
    title: "새가족 교육 과정 개강",
    church: "새생명교회",
    category: "행사안내",
    summary: "처음 오신 분을 위한 4주 과정의 새가족 교육을 시작합니다. 주일 예배 뒤 소예배실에서 모입니다.",
  },
  {
    title: "교회 홈페이지 개편 안내",
    church: "열린문교회",
    category: "일반공지",
    summary: "홈페이지가 새 모습으로 바뀌었습니다. 예배 영상과 주보를 휴대폰에서도 편하게 볼 수 있습니다.",
  },
];
const NOTICE_DATE = /^\d{4}\. \d{1,2}\. \d{1,2}$/;

const noticeList = (page: Page) => page.getByRole("region", { name: "공지 목록", exact: true });
const noticeItems = (page: Page) =>
  noticeList(page)
    .getByRole("listitem")
    .filter({ has: page.getByRole("heading", { level: 3 }) });

test.describe("공지 목록", () => {
  test("페이지 제목과 공지 8개를 최신순으로 분류, 날짜, 교회, 요약과 함께 보여 준다", async ({ page }) => {
    await page.goto("/notices");
    await expect(page.getByRole("heading", { level: 1, name: "공지", exact: true })).toBeVisible();
    await expect(noticeList(page).getByRole("status")).toHaveText("총 8개");

    const items = noticeItems(page);
    await expect(items).toHaveCount(NOTICES.length);
    for (const [index, { title, church, category, summary }] of NOTICES.entries()) {
      const item = items.nth(index);
      await expect(item.getByRole("heading", { level: 3 })).toHaveText(title);
      await expect(item.getByText(category, { exact: true })).toBeVisible();
      await expect(item.getByText(summary, { exact: true })).toBeVisible();
      await expect(item.locator("time")).toHaveText(NOTICE_DATE);
      await expect(item).toContainText(church);
    }
  });

  for (const width of [375, 768, 1440]) {
    test(`${width}px 폭에서 공지가 한 열로 놓이고 가로 스크롤이 생기지 않는다`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/notices");
      const boxes = await noticeItems(page).evaluateAll((items) =>
        items.map((item) => {
          const { left, top } = item.getBoundingClientRect();
          return { left: Math.round(left), top: Math.round(top) };
        }),
      );
      expect(boxes).toHaveLength(NOTICES.length);
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

  test("띄어쓰기 없는 긴 제목도 줄을 바꿔 375px에서 가로 스크롤을 만들지 않는다", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto("/notices");
    // 목데이터 제목은 모두 짧아서, 실제 데이터에 올 수 있는 긴 제목을 화면에서 직접 넣어 본다
    await noticeItems(page)
      .first()
      .getByRole("heading", { level: 3 })
      .evaluate((heading) => {
        heading.textContent = "지역연합기도회장소가본당에서교육관이층대강당으로변경되었습니다";
      });

    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflows).toBe(false);
  });
});

// 분류 칩은 정해진 분류 순서다(많이 쓰인 순서가 아님)
const CATEGORY_CHIPS = ["행사안내", "일정변경", "모집안내", "일반공지"];
const SCHEDULE_CHANGES = ["지역 연합 기도회 장소가 변경되었습니다", "주일 예배 시간 변경 안내"];

const categoryFilter = (page: Page) => page.getByRole("navigation", { name: "분류 필터", exact: true });
const categoryParam = (page: Page) => new URL(page.url()).searchParams.get("category");

test.describe("공지 분류 필터", () => {
  test("칩이 '전체' 다음에 정해진 분류 순서로 놓이고, 처음에는 '전체'가 선택되어 있다", async ({ page }) => {
    await page.goto("/notices");
    await expect(categoryFilter(page).getByRole("link")).toHaveText(["전체", ...CATEGORY_CHIPS]);
    await expect(categoryFilter(page).locator('[aria-current="true"]')).toHaveText("전체");
  });

  test("'일정변경'을 누르면 일정변경 공지만 남고, 주소와 개수 안내에 분류가 들어간다", async ({ page }) => {
    await page.goto("/notices");
    await categoryFilter(page).getByRole("link", { name: "일정변경", exact: true }).click();

    await expect.poll(() => categoryParam(page)).toBe("일정변경");
    await expect(noticeItems(page).getByRole("heading", { level: 3 })).toHaveText(SCHEDULE_CHANGES);
    await expect(categoryFilter(page).locator('[aria-current="true"]')).toHaveAccessibleName("일정변경 선택 해제");
    await expect(noticeList(page).getByRole("status")).toHaveText("일정변경 2개");
  });

  test("선택한 칩을 다시 누르면 전체로 돌아간다", async ({ page }) => {
    await page.goto(`/notices?category=${encodeURIComponent("일정변경")}`);
    await expect(noticeItems(page)).toHaveCount(SCHEDULE_CHANGES.length);
    await categoryFilter(page).getByRole("link", { name: "일정변경 선택 해제", exact: true }).click();

    await expect(page).toHaveURL("/notices");
    await expect(noticeItems(page)).toHaveCount(NOTICES.length);
    await expect(categoryFilter(page).locator('[aria-current="true"]')).toHaveText("전체");
    await expect(page).toHaveTitle("공지 | 함께하는 교회");
  });

  test("분류가 붙은 주소로 바로 들어와도 거른 결과를 보여 준다", async ({ page }) => {
    await page.goto(`/notices?category=${encodeURIComponent("모집안내")}`);
    await expect(noticeItems(page).getByRole("heading", { level: 3 })).toHaveText([
      "다음세대 수련회 등록 안내",
      "연합 찬양제 참가팀 모집",
    ]);
  });

  test("공지에 없는 분류면 빈 안내를 보여 주고, '전체 공지 보기'로 돌아갈 수 있다", async ({ page }) => {
    // "기도제목"은 커뮤니티 글의 분류라 공지 칩에 없다
    await page.goto(`/notices?category=${encodeURIComponent("기도제목")}`);
    await expect(noticeList(page).getByText("고른 분류의 공지가 없습니다.", { exact: true })).toBeVisible();
    await expect(noticeList(page).getByRole("status")).toHaveText("맞는 공지 0개");
    // 칩에 없는 분류는 주소에서 온 아무 글자일 수 있어 화면에 다시 적지 않는다
    await expect(page.locator("main")).not.toContainText("기도제목");
    await expect(noticeItems(page)).toHaveCount(0);
    await expect(categoryFilter(page).locator('[aria-current="true"]')).toHaveCount(0);

    await noticeList(page).getByRole("link", { name: "전체 공지 보기", exact: true }).click();
    await expect(page).toHaveURL("/notices");
    await expect(noticeItems(page)).toHaveCount(NOTICES.length);
  });
});
