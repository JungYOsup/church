import { defineConfig, devices } from "@playwright/test";

// 개발 서버(3000)와 부딪히지 않도록 빌드한 결과를 3100 포트로 띄워 시험한다.
const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  reporter: "list",
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
    url: BASE_URL,
    timeout: 180_000,
    reuseExistingServer: false,
  },
});
