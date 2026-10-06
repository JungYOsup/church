import { readFileSync } from "node:fs";
import path from "node:path";
import { test as base, expect, type Page } from "@playwright/test";

/**
 * 카카오맵 SDK 요청에 무엇을 돌려줄지.
 * - unavailable(기본): 빈 스크립트. kakao가 없어 지도 자리에 대체 화면이 나온다
 * - fake: e2e/kakao-fake.js. 지도를 그리지 않지만 핀(오버레이)과 지도 이동(idle)을 흉내 낸다
 */
type KakaoSdk = "unavailable" | "fake";

const FAKE_KAKAO_SDK = readFileSync(path.join(__dirname, "kakao-fake.js"), "utf8");

export const test = base.extend<{ kakaoSdk: KakaoSdk; consoleErrors: string[] }>({
  kakaoSdk: ["unavailable", { option: true }],

  // 실제 카카오 서버에 기대지 않는다. 테스트 빌드의 키는 가짜(playwright.config.ts)이고,
  // 등록된 도메인도 localhost:3000뿐이라 3100에서는 어차피 인증에 실패한다.
  // 요청을 막으면(abort) 콘솔 에러가 남으므로, 막는 대신 빈 스크립트를 200으로 돌려준다.
  // 두 번째 인자를 Playwright 문서처럼 use라고 부르면 react-hooks 규칙이 훅 호출로 오인한다.
  page: async ({ page, kakaoSdk }, provide) => {
    await page.route("https://dapi.kakao.com/**", (route) =>
      route.fulfill({
        contentType: "text/javascript",
        body: kakaoSdk === "fake" ? FAKE_KAKAO_SDK : "",
      }),
    );
    await provide(page);
  },

  // 모든 테스트에 자동으로 붙는다. 테스트 중 브라우저 콘솔 에러나 처리되지 않은 예외가 있으면 실패한다.
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));
      await use(errors);
      expect(errors, "브라우저 콘솔 에러").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** 지도에 보이는 범위. level을 주면 확대 수준도 바꾼다(숫자가 작을수록 가깝다) */
interface FakeMapView {
  south: number;
  west: number;
  north: number;
  east: number;
  level?: number;
}

/** e2e/kakao-fake.js가 window.__fakeKakao에 두는 조작 손잡이 */
interface FakeKakaoHandle {
  moveTo(view: FakeMapView, index?: number): void;
  center(index?: number): { lat: number; lng: number };
}
// 앱의 전역 Window 타입에 테스트용 속성이 새지 않도록 declare global 대신 여기서만 바꿔 쓴다
type FakeKakaoWindow = { __fakeKakao: FakeKakaoHandle };

/** 사용자가 지도를 옮긴 것처럼 가짜 지도의 범위를 바꾸고 idle을 일으킨다 (kakaoSdk: "fake"에서만) */
export function moveFakeMap(page: Page, view: FakeMapView, index = 0) {
  return page.evaluate(
    ([target, mapIndex]) => (window as unknown as FakeKakaoWindow).__fakeKakao.moveTo(target, mapIndex),
    [view, index] as const,
  );
}

/** 가짜 지도의 지금 중심 좌표 (kakaoSdk: "fake"에서만) */
export function fakeMapCenter(page: Page, index = 0) {
  return page.evaluate((mapIndex) => (window as unknown as FakeKakaoWindow).__fakeKakao.center(mapIndex), index);
}
