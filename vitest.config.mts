import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

// 배포 서버(Vercel)처럼 UTC에서 돌려, 시간대를 빼먹은 날짜 코드를 KST 컴퓨터에서도 잡는다.
// test.env의 TZ는 threads pool에 적용되지 않아서, worker가 뜨기 전인 여기서 정한다(Vitest common-errors).
process.env.TZ = "UTC";

// 순수 로직의 단위 테스트만 돌린다. 화면 동작은 e2e/(Playwright)가 맡으므로
// 기본 범위대로 두면 e2e/*.spec.ts까지 잡혀서 src 아래로 좁힌다.
export default defineConfig({
  resolve: {
    alias: { "@": resolve(import.meta.dirname, "src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
