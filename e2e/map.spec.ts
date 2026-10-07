import type { Locator, Page } from "@playwright/test";
import { expect, fakeMapCenter, moveFakeMap, test } from "./fixtures";

// 교회 지도 명세. 목데이터(src/lib/mock/churches.ts)를 가져오지 않고 직접 적는다.
// 실제 카카오맵은 쓰지 않는다. kakaoSdk: "fake"면 e2e/kakao-fake.js가 핀과 지도 이동을 흉내 내고,
// 기본(unavailable)이면 SDK가 없어 지도 자리에 대체 화면이 나온다(e2e/fixtures.ts).
const ALL_CHURCHES = [
  "서연교회",
  "한강교회",
  "사랑의교회",
  "샘물교회",
  "드림교회",
  "서울교회",
  "빛과소금교회",
  "새생명교회",
  "열린문교회",
  "은혜교회",
  "기쁨교회",
  "평화교회",
  "열매교회",
  "하늘빛교회",
  "생명샘교회",
];

// 서울 도심의 작은 사각형. 안에 드는 교회는 좌표로 직접 세었다(목데이터 순서)
const DOWNTOWN = { south: 37.5, west: 126.95, north: 37.58, east: 127.05 };
const DOWNTOWN_CHURCHES = ["서연교회", "사랑의교회", "샘물교회", "빛과소금교회"];
// 교회가 하나도 없는 바다 위
const EAST_SEA = { south: 37.0, west: 129.5, north: 37.2, east: 129.8 };

const mapArea = (page: Page) => page.getByRole("region", { name: "지도", exact: true });
const churchList = (page: Page) => page.getByRole("region", { name: "교회 목록", exact: true });
const churchItems = (page: Page) => churchList(page).getByRole("listitem");
const pin = (page: Page, name: string) => mapArea(page).getByRole("button", { name, exact: true });
// 목록 줄 버튼의 이름은 교회 이름으로 시작하고 지역·목사·인원이 이어진다
const row = (page: Page, name: string) => churchList(page).getByRole("button", { name });
/** 고른 교회의 상세 링크. 목록 줄 아래와 지도의 사진 카드에 같은 이름으로 있다 */
const detailLink = (scope: Locator, name: string) =>
  scope.getByRole("link", { name: `${name} 자세히 보기`, exact: true });
// 기쁨교회(경기 수원시)의 좌표
const JOY_CHURCH = { lat: 37.2636, lng: 127.0286 };
// 화면에 보이는 이름표 수. 숨긴 이름표도 버튼 이름으로는 남으므로(sr-only) 폭으로 가린다.
// 이름표는 글자가 있는 span이다. 고른 핀의 사진 카드(글자 없는 span)를 이름표로 세지 않는다
const visibleLabelCount = (page: Page) =>
  mapArea(page)
    .getByRole("button")
    .evaluateAll(
      (pins) =>
        pins.filter((pin) => {
          const label = [...pin.querySelectorAll("span")].find((span) => span.textContent?.trim());
          return (label?.getBoundingClientRect().width ?? 0) > 1;
        }).length,
    );

test.describe("교회 지도", () => {
  test("페이지 제목과 탭 제목", async ({ page }) => {
    await page.goto("/map");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("교회 지도");
    await expect(page).toHaveTitle("교회 지도 | 함께하는 교회");
  });

  test.describe("SDK를 불러오면", () => {
    test.use({ kakaoSdk: "fake" });

    test("교회마다 지도에 핀을 꽂는다", async ({ page }) => {
      await page.goto("/map");
      await expect(mapArea(page).getByRole("button")).toHaveText(ALL_CHURCHES);
      await expect(mapArea(page)).not.toContainText("지도를 표시할 수 없습니다");
    });

    test("멀리 보면 이름표를 숨기고, 가까이 보면 보여 준다", async ({ page }) => {
      await page.goto("/map");
      await expect(mapArea(page).getByRole("button")).toHaveCount(ALL_CHURCHES.length);
      // 교회 15곳에 맞춘 처음 수준(10)에서는 이름표가 서로 겹치므로 숨긴다. 버튼 이름으로는 남는다
      await expect.poll(() => visibleLabelCount(page)).toBe(0);
      await expect(mapArea(page).getByRole("button", { name: "서연교회", exact: true })).toBeVisible();

      await moveFakeMap(page, { south: 37.2, west: 126.7, north: 37.7, east: 127.2, level: 7 });
      await expect.poll(() => visibleLabelCount(page)).toBe(ALL_CHURCHES.length);
    });
  });

  test("SDK를 받았지만 지도를 만들다 실패하면 대체 화면을 보여 준다", async ({ page }) => {
    // 나중에 건 route가 먼저 맞는다. 불러오기는 되지만 지도 생성자가 던지는 SDK
    await page.route("https://dapi.kakao.com/**", (route) =>
      route.fulfill({
        contentType: "text/javascript",
        body: `window.kakao = { maps: {
          load(callback) { setTimeout(callback, 0); },
          LatLng: function () {},
          Map: function () { throw new Error("지도 생성 실패"); },
        } };`,
      }),
    );
    await page.goto("/map");
    await expect(mapArea(page)).toContainText("지도를 표시할 수 없습니다");
  });

  test("SDK를 쓸 수 없으면 지도 자리에 대체 화면을 보여 준다", async ({ page }) => {
    await page.goto("/map");
    await expect(mapArea(page)).toContainText("지도를 표시할 수 없습니다");
    await expect(mapArea(page).getByRole("button")).toHaveCount(0);
  });
});

test.describe("지도 범위", () => {
  test.describe("SDK를 불러오면", () => {
    test.use({ kakaoSdk: "fake" });

    test("처음에는 교회가 모두 보이게 맞추고 15곳을 목록에 보여 준다", async ({ page }) => {
      await page.goto("/map");
      await expect(churchList(page).getByRole("status")).toHaveText("현재 지도 범위 내 교회 15개");
      await expect(churchItems(page)).toHaveCount(ALL_CHURCHES.length);
      for (const [index, name] of ALL_CHURCHES.entries()) {
        await expect(churchItems(page).nth(index)).toContainText(name);
      }
    });

    test("지도를 옮기면 그 범위 안의 교회만 목록에 남는다", async ({ page }) => {
      await page.goto("/map");
      await expect(churchItems(page)).toHaveCount(ALL_CHURCHES.length);
      // 지도가 준비된 뒤에 옮긴다. 목록 15개는 지도가 준비되기 전에도 보이므로 준비 신호가 아니다
      await expect(churchList(page).getByRole("status")).toHaveText("현재 지도 범위 내 교회 15개");

      await moveFakeMap(page, DOWNTOWN);
      await expect(churchList(page).getByRole("status")).toHaveText(
        `현재 지도 범위 내 교회 ${DOWNTOWN_CHURCHES.length}개`,
      );
      await expect(churchItems(page)).toHaveCount(DOWNTOWN_CHURCHES.length);
      for (const [index, name] of DOWNTOWN_CHURCHES.entries()) {
        await expect(churchItems(page).nth(index)).toContainText(name);
      }
    });

    test("범위 안에 교회가 없으면 지도를 옮겨 보라고 안내한다", async ({ page }) => {
      await page.goto("/map");
      await expect(churchItems(page)).toHaveCount(ALL_CHURCHES.length);
      // 지도가 준비된 뒤에 옮긴다(위 테스트와 같은 이유)
      await expect(churchList(page).getByRole("status")).toHaveText("현재 지도 범위 내 교회 15개");

      await moveFakeMap(page, EAST_SEA);
      await expect(churchList(page).getByRole("status")).toHaveText("현재 지도 범위 내 교회 0개");
      await expect(churchItems(page)).toHaveCount(0);
      await expect(churchList(page)).toContainText("지도 범위 안에 교회가 없습니다");
    });

    test("지역을 바꾸는 동안 앞 지역의 범위로 거른 개수를 보이지 않는다", async ({ page }) => {
      await page.goto("/map");
      // 지도가 준비된 뒤에 옮긴다
      await expect(churchList(page).getByRole("status")).toHaveText("현재 지도 범위 내 교회 15개");
      // 수원 근처: 기쁨교회 한 곳만 든다
      await moveFakeMap(page, { south: 37.2, west: 126.9, north: 37.3, east: 127.1 });
      await expect(churchList(page).getByRole("status")).toHaveText("현재 지도 범위 내 교회 1개");

      // 개수 문구가 바뀔 때마다 기록한다(그려지기 전의 DOM 변화도 화면 읽기 프로그램에 전해질 수 있다)
      await churchList(page)
        .getByRole("status")
        .evaluate((status) => {
          const seen: string[] = [];
          (window as unknown as { __statusTexts: string[] }).__statusTexts = seen;
          new MutationObserver(() => seen.push(status.textContent ?? "")).observe(status, {
            childList: true,
            characterData: true,
            subtree: true,
          });
        });
      await page.getByRole("navigation", { name: "지역 필터", exact: true }).getByRole("link", { name: "서울", exact: true }).click();
      await expect(churchList(page).getByRole("status")).toHaveText("현재 지도 범위 내 교회 9개");
      const texts = await page.evaluate(() => (window as unknown as { __statusTexts: string[] }).__statusTexts);
      expect(texts, "서울 교회를 수원 범위로 거른 0개가 끼지 않는다").not.toContain("현재 지도 범위 내 교회 0개");
    });

    test("같은 교회를 다시 받으면 옮겨 둔 지도를 그대로 둔다", async ({ page }) => {
      await page.goto("/map");
      // 지도가 준비된 뒤에 옮긴다
      await expect(churchList(page).getByRole("status")).toHaveText("현재 지도 범위 내 교회 15개");
      await moveFakeMap(page, DOWNTOWN);
      await expect(churchList(page).getByRole("status")).toHaveText(`현재 지도 범위 내 교회 ${DOWNTOWN_CHURCHES.length}개`);

      // 이미 고른 '전체' 칩을 다시 누르면 같은 주소로 이동해 페이지를 새로 받는다
      const refetched = page.waitForResponse((response) => new URL(response.url()).pathname === "/map");
      await page.getByRole("navigation", { name: "지역 필터", exact: true }).getByRole("link", { name: "전체", exact: true }).click();
      await refetched;
      await page.waitForTimeout(300);
      await expect(churchList(page).getByRole("status")).toHaveText(`현재 지도 범위 내 교회 ${DOWNTOWN_CHURCHES.length}개`);
    });
  });

  test("지도를 쓸 수 없으면 교회 15곳을 모두 보여 준다", async ({ page }) => {
    await page.goto("/map");
    await expect(mapArea(page)).toContainText("지도를 표시할 수 없습니다");
    await expect(churchList(page).getByRole("status")).toHaveText("교회 15개");
    await expect(churchItems(page)).toHaveCount(ALL_CHURCHES.length);
  });

  for (const width of [375, 768, 1440]) {
    test(`${width}px 폭에서 목록과 지도가 겹치지 않게 놓이고 가로 스크롤이 생기지 않는다`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/map");
      const map = await mapArea(page).boundingBox();
      const list = await churchList(page).boundingBox();
      if (!map || !list) throw new Error("지도나 목록이 화면에 없습니다");

      if (width < 1024) {
        expect(list.y, "지도 아래에 목록").toBeGreaterThanOrEqual(map.y + map.height);
      } else {
        expect(list.x + list.width, "목록이 지도 왼쪽").toBeLessThanOrEqual(map.x);
        expect(Math.abs(list.y - map.y), "목록과 지도의 위쪽이 같다").toBeLessThanOrEqual(1);
      }

      const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflows).toBe(false);
    });
  }
});

test.describe("교회 고르기", () => {
  test.use({ kakaoSdk: "fake" });

  test("핀을 누르면 그 교회를 고르고, 핀 위에 사진과 이름표를 보여 준다", async ({ page }) => {
    await page.goto("/map");
    await expect(row(page, "서연교회")).toHaveAttribute("aria-pressed", "false");
    // 처음 수준(10)에서는 이름표를 숨긴다
    await expect.poll(() => visibleLabelCount(page)).toBe(0);

    await pin(page, "서연교회").click();
    await expect(pin(page, "서연교회")).toHaveAttribute("aria-pressed", "true");
    await expect(row(page, "서연교회")).toHaveAttribute("aria-pressed", "true");
    // 핀 위 사진 카드는 상세로 가는 링크다. 사진은 장식(alt="")이라 img 역할이 없어 요소로 찾는다
    await expect(detailLink(mapArea(page), "서연교회").locator("img")).toBeVisible();
    // 멀리 볼 때도 고른 교회의 이름표만은 보인다
    await expect.poll(() => visibleLabelCount(page)).toBe(1);
  });

  test("목록에서 고르면 그 핀을 고르고 지도가 그 교회로 옮겨 간다", async ({ page }) => {
    await page.goto("/map");
    await row(page, "기쁨교회").click();
    await expect(pin(page, "기쁨교회")).toHaveAttribute("aria-pressed", "true");
    await expect(row(page, "기쁨교회")).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => fakeMapCenter(page)).toEqual(JOY_CHURCH);
  });

  test("다른 교회를 고르면 앞의 고르기가 풀리고, 고른 교회를 다시 누르면 고르기가 풀린다", async ({ page }) => {
    await page.goto("/map");
    // 고르면 지도가 그 교회로 옮겨 가 목록이 바뀐다. 핀은 범위와 상관없이 늘 지도에 있으므로 나중에 핀을 누른다
    await row(page, "기쁨교회").click();
    await pin(page, "서연교회").click();
    await expect(mapArea(page).locator('button[aria-pressed="true"]')).toHaveText(["서연교회"]);
    await expect(churchList(page).locator('button[aria-pressed="true"]')).toHaveCount(1);
    await expect(row(page, "서연교회")).toHaveAttribute("aria-pressed", "true");

    await pin(page, "서연교회").click();
    await expect(pin(page, "서연교회")).toHaveAttribute("aria-pressed", "false");
    await expect(churchList(page).locator('button[aria-pressed="true"]')).toHaveCount(0);
  });

  test("키보드로 핀을 고르면 포커스가 그 핀에 남는다", async ({ page }) => {
    await page.goto("/map");
    await pin(page, "서연교회").focus();
    await page.keyboard.press("Enter");
    await expect(pin(page, "서연교회")).toHaveAttribute("aria-pressed", "true");
    await expect(pin(page, "서연교회")).toBeFocused();
  });

  test("고른 교회가 빠지는 지역을 골랐다가 전체로 돌아오면 고르기가 풀려 있다", async ({ page }) => {
    await page.goto("/map");
    await pin(page, "서연교회").click();
    await expect(pin(page, "서연교회")).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("navigation", { name: "지역 필터", exact: true }).getByRole("link", { name: "경기", exact: true }).click();
    await expect(churchItems(page)).toHaveCount(6);
    await page
      .getByRole("navigation", { name: "지역 필터", exact: true })
      .getByRole("link", { name: "경기 선택 해제", exact: true })
      .click();

    await expect(churchItems(page)).toHaveCount(ALL_CHURCHES.length);
    await expect(mapArea(page).locator('button[aria-pressed="true"]')).toHaveCount(0);
    await expect(churchList(page).locator('button[aria-pressed="true"]')).toHaveCount(0);
    // 고른 교회로 옮겨 가지 않고 교회 15곳에 맞춘 그대로다
    await expect(churchList(page).getByRole("status")).toHaveText("현재 지도 범위 내 교회 15개");
  });

  test("고른 교회가 남는 지역을 고르면 지도가 그 지역 교회 모두에 맞춰진다", async ({ page }) => {
    await page.goto("/map");
    await row(page, "기쁨교회").click();
    await expect.poll(() => fakeMapCenter(page)).toEqual(JOY_CHURCH);

    await page.getByRole("navigation", { name: "지역 필터", exact: true }).getByRole("link", { name: "경기", exact: true }).click();
    await expect(churchList(page).getByRole("status")).toHaveText("현재 지도 범위 내 교회 6개");
    await expect(churchItems(page)).toHaveCount(6);
    await expect(pin(page, "기쁨교회")).toHaveAttribute("aria-pressed", "true");
  });

  test("고른 교회의 목록 줄 아래에 상세 링크가 생기고, 고르기를 풀면 사라진다", async ({ page }) => {
    await page.goto("/map");
    await expect(detailLink(churchList(page), "서연교회")).toHaveCount(0);
    await row(page, "서연교회").click();
    await expect(detailLink(churchList(page), "서연교회")).toBeVisible();
    await row(page, "서연교회").click();
    await expect(detailLink(churchList(page), "서연교회")).toHaveCount(0);

    await row(page, "서연교회").click();
    await detailLink(churchList(page), "서연교회").click();
    await expect(page).toHaveURL("/churches/church-1");
    await expect(page.getByRole("heading", { level: 1, name: "서연교회", exact: true })).toBeVisible();
  });

  test("지도의 사진 카드도 고른 교회의 상세 링크다", async ({ page }) => {
    await page.goto("/map");
    await pin(page, "기쁨교회").click();
    await expect(detailLink(mapArea(page), "기쁨교회")).toHaveAttribute("href", "/churches/church-11");
    // 고르지 않은 교회에는 링크가 없다
    await expect(mapArea(page).getByRole("link")).toHaveCount(1);
  });

  test("키보드로 목록 줄을 골라도 같다", async ({ page }) => {
    await page.goto("/map");
    await row(page, "한강교회").focus();
    await page.keyboard.press("Enter");
    await expect(pin(page, "한강교회")).toHaveAttribute("aria-pressed", "true");
    await expect(row(page, "한강교회")).toBeFocused();
  });
});

// 지역 칩은 교회가 많은 지역부터다(서울 9곳, 경기 6곳)
const REGION_CHIPS = ["서울", "경기"];
const GYEONGGI_CHURCHES = ["은혜교회", "기쁨교회", "평화교회", "열매교회", "하늘빛교회", "생명샘교회"];
const regionFilter = (page: Page) => page.getByRole("navigation", { name: "지역 필터", exact: true });
const regionParam = (page: Page) => new URL(page.url()).searchParams.get("region");

test.describe("지역 필터", () => {
  test("칩이 '전체' 다음에 교회가 많은 지역 순서로 놓이고, 처음에는 '전체'가 선택되어 있다", async ({ page }) => {
    await page.goto("/map");
    await expect(regionFilter(page).getByRole("link")).toHaveText(["전체", ...REGION_CHIPS]);
    await expect(regionFilter(page).locator('[aria-current="true"]')).toHaveText("전체");
  });

  test.describe("SDK를 불러오면", () => {
    test.use({ kakaoSdk: "fake" });

    test("'경기'를 누르면 경기 교회만 남고, 지도가 그 교회들에 맞춰진다", async ({ page }) => {
      await page.goto("/map");
      await regionFilter(page).getByRole("link", { name: "경기", exact: true }).click();

      await expect.poll(() => regionParam(page)).toBe("경기");
      await expect(churchItems(page)).toHaveCount(GYEONGGI_CHURCHES.length);
      for (const [index, name] of GYEONGGI_CHURCHES.entries()) {
        await expect(churchItems(page).nth(index)).toContainText(name);
      }
      await expect(churchList(page).getByRole("status")).toHaveText(
        `현재 지도 범위 내 교회 ${GYEONGGI_CHURCHES.length}개`,
      );
      await expect(mapArea(page).getByRole("button")).toHaveText(GYEONGGI_CHURCHES);
      await expect(regionFilter(page).locator('[aria-current="true"]')).toHaveAccessibleName("경기 선택 해제");
    });
  });

  test("선택한 칩을 다시 누르면 전체로 돌아간다", async ({ page }) => {
    await page.goto(`/map?region=${encodeURIComponent("경기")}`);
    await expect(churchItems(page)).toHaveCount(GYEONGGI_CHURCHES.length);
    await regionFilter(page).getByRole("link", { name: "경기 선택 해제", exact: true }).click();

    await expect(page).toHaveURL("/map");
    await expect(churchItems(page)).toHaveCount(ALL_CHURCHES.length);
    await expect(regionFilter(page).locator('[aria-current="true"]')).toHaveText("전체");
    await expect(page).toHaveTitle("교회 지도 | 함께하는 교회");
  });

  test("교회가 없는 지역이면 빈 안내를 보여 주고, '전체 교회 보기'로 돌아갈 수 있다", async ({ page }) => {
    await page.goto(`/map?region=${encodeURIComponent("부산")}`);
    await expect(churchList(page).getByText("고른 지역의 교회가 없습니다.", { exact: true })).toBeVisible();
    await expect(churchList(page).getByRole("status")).toHaveText("맞는 교회 0개");
    // 칩에 없는 지역은 주소에서 온 아무 글자일 수 있어 화면에 다시 적지 않는다
    await expect(page.locator("main")).not.toContainText("부산");
    await expect(churchItems(page)).toHaveCount(0);
    await expect(regionFilter(page).locator('[aria-current="true"]')).toHaveCount(0);

    await churchList(page).getByRole("link", { name: "전체 교회 보기", exact: true }).click();
    await expect(page).toHaveURL("/map");
    await expect(churchItems(page)).toHaveCount(ALL_CHURCHES.length);
  });
});

test.describe("지도를 쓸 수 없을 때의 상세 링크", () => {
  test("목록에서 고른 교회의 상세 링크로 갈 수 있다", async ({ page }) => {
    await page.goto("/map");
    await row(page, "한강교회").click();
    await detailLink(churchList(page), "한강교회").click();
    await expect(page).toHaveURL("/churches/church-2");
  });
});
