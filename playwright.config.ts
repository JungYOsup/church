import { defineConfig, devices } from "@playwright/test";

// 개발 서버(3000)와 부딪히지 않도록 빌드한 결과를 3100 포트로 띄워 시험한다.
const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  reporter: "list",
  // test.only를 남긴 채 커밋하면 로컬에서는 그 테스트 하나만 돌고 통과해 pre-commit이 잡지 못한다.
  // CI(GitHub Actions가 CI=true를 둠)에서는 실패하게 한다
  forbidOnly: !!process.env.CI,
  // 기본값(CPU의 절반, 이 컴퓨터는 5)으로 돌리면 부하가 커져 클릭의 "안정" 대기가 5초를 넘기며 흔들렸다
  // (docs/lessons.md). 3으로 줄여 부하를 낮춘다
  workers: 3,
  use: {
    baseURL: BASE_URL,
    locale: "ko-KR",
    trace: "retain-on-failure",
    // 로컬 페이지라 5초면 충분하다. 요소를 못 찾으면 기본 30초 대신 빨리 실패한다.
    actionTimeout: 5_000,
  },
  projects: [
    {
      name: "chrome",
      // 설치된 Google Chrome을 쓴다. CI에서는 `npx playwright install chrome`이 필요하다.
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    // 카카오맵 키는 .env.local과 상관없이 가짜로 빌드한다(process.env가 .env.local보다 먼저다).
    // 지도 테스트는 SDK 요청을 가짜로 받으므로(e2e/fixtures.ts) 진짜 키가 필요 없다.
    // 그래서 테스트 뒤 .next에는 가짜 키가 남는다. 데모는 npm run build를 다시 한 뒤 띄운다.
    env: { NEXT_PUBLIC_KAKAO_MAP_KEY: "e2e-fake-key" },
    url: BASE_URL,
    timeout: 180_000,
    reuseExistingServer: false,
  },
});
