import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

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
