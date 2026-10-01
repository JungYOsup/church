import { test as base, expect } from "@playwright/test";

// 모든 테스트에 자동으로 붙는다. 테스트 중 브라우저 콘솔 에러나 처리되지 않은 예외가 있으면 실패한다.
export const test = base.extend<{ consoleErrors: string[] }>({
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
