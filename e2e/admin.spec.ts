import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

// 대표자 관리 명세. 목데이터(src/lib/mock/user.ts, churches.ts, events.ts, notices.ts)를 가져오지 않고 직접 적는다.
// 현재 사용자는 서연교회 대표자 김은혜 집사다. 승인일은 요청 시각 기준 상대값이라 꼴만 확인한다.
const DATE = /^\d{4}\. \d{1,2}\. \d{1,2}$/;

const adminTabs = (page: Page) => page.getByRole("navigation", { name: "대표자 관리 메뉴", exact: true });
const tab = (page: Page, name: "내 교회" | "교회 등록·인증 신청") =>
  adminTabs(page).getByRole("link", { name, exact: true });
const region = (page: Page, name: string) => page.getByRole("region", { name, exact: true });

test.describe("대표자 관리 내 교회", () => {
  test("페이지 제목과 '내 교회' 탭이 현재 탭으로 보인다", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { level: 1, name: "대표자 관리", exact: true })).toBeVisible();
    await expect(page).toHaveTitle("대표자 관리 | 함께하는 교회");
    await expect(tab(page, "내 교회")).toHaveAttribute("aria-current", "page");
    await expect(tab(page, "교회 등록·인증 신청")).not.toHaveAttribute("aria-current");
  });

  test("인증 상태와 승인일을 보여 준다", async ({ page }) => {
    await page.goto("/admin");
    const verification = region(page, "인증 상태");
    await expect(verification.getByText("인증 완료", { exact: true })).toBeVisible();
    await expect(verification.locator("time")).toHaveText(DATE);
  });

  test("내 교회의 이름, 목사, 지역, 교인 수, 태그를 보여 준다", async ({ page }) => {
    await page.goto("/admin");
    const church = region(page, "교회 정보");
    await expect(church.getByRole("heading", { level: 3, name: "서연교회", exact: true })).toBeVisible();
    await expect(church).toContainText("김성민 목사");
    await expect(church).toContainText("서울 용산구");
    await expect(church).toContainText("530명");
    await expect(church.getByRole("listitem")).toHaveText(["다음세대", "지역섬김", "예배"]);
  });

  test("내 교회의 다가오는 행사와 공지만 보여 준다", async ({ page }) => {
    await page.goto("/admin");
    const events = region(page, "다가오는 행사").getByRole("listitem");
    await expect(events).toHaveCount(1);
    await expect(events.first().getByRole("heading", { level: 3 })).toHaveText("청년 연합 찬양집회");
    await expect(events.first().locator("time")).toHaveText(/^\d{4}\. \d{1,2}\. \d{1,2} \(.\) 오[전후] \d{1,2}:\d{2}$/);

    const notices = region(page, "공지").getByRole("listitem").filter({ has: page.getByRole("heading", { level: 3 }) });
    await expect(notices).toHaveCount(1);
    await expect(notices.first().getByRole("heading", { level: 3 })).toHaveText("특별새벽기도회에 여러분을 초대합니다");
  });

  test("쓰기·고치기 버튼은 아직 비활성이고 이유를 적어 둔다", async ({ page }) => {
    await page.goto("/admin");
    for (const name of ["교회 정보 고치기", "새 행사 등록", "새 공지 쓰기"]) {
      await expect(page.getByRole("button", { name, exact: true })).toBeDisabled();
    }
    await expect(page.getByText("로그인 기능과 함께 2단계에서 열립니다.").first()).toBeVisible();
  });
});

test.describe("대표자 관리 탭", () => {
  test("'교회 등록·인증 신청'을 누르면 신청 탭으로, '내 교회'를 누르면 돌아온다", async ({ page }) => {
    await page.goto("/admin");
    await tab(page, "교회 등록·인증 신청").click();
    await expect(page).toHaveURL("/admin?tab=register");
    await expect(tab(page, "교회 등록·인증 신청")).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { level: 2, name: "교회 등록·인증 신청", exact: true })).toBeVisible();
    await expect(region(page, "교회 정보")).toHaveCount(0);
    await expect(page).toHaveTitle("대표자 관리 | 함께하는 교회");

    await tab(page, "내 교회").click();
    await expect(page).toHaveURL("/admin");
    await expect(tab(page, "내 교회")).toHaveAttribute("aria-current", "page");
    await expect(region(page, "교회 정보")).toBeVisible();
  });

  test("모르는 탭 값이면 '내 교회'를 보여 준다", async ({ page }) => {
    await page.goto("/admin?tab=foo");
    await expect(tab(page, "내 교회")).toHaveAttribute("aria-current", "page");
    await expect(region(page, "교회 정보")).toBeVisible();
  });

  for (const width of [375, 768, 1440]) {
    test(`${width}px 폭에서 두 탭 모두 가로 스크롤이 생기지 않는다`, async ({ page }) => {
      // 신청 탭은 폼이 길어 세로로 길어지지만 가로로는 넘치지 않아야 한다
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/admin", "/admin?tab=register"]) {
        await page.goto(path);
        const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        expect(overflows, path).toBe(false);
      }
    });
  }
});

const registerForm = (page: Page) => page.getByRole("form", { name: "교회 등록·인증 신청", exact: true });
const field = (page: Page, label: string) => registerForm(page).getByLabel(label, { exact: true });
const AGREEMENT = "입력한 내용이 사실이며, 관리자 확인에 쓰이는 데 동의합니다.";

/** 신청 폼을 올바른 값으로 채운다. 대표자 이름과 직분은 미리 채워져 있다 */
async function fillValidRegistration(page: Page) {
  await field(page, "교회 이름").fill("소망교회");
  await field(page, "담임목사").fill("박하늘");
  await field(page, "지역").selectOption("경기");
  await field(page, "주소").fill("경기도 성남시 분당구 정자동");
  await field(page, "연락처").fill("010-1234-5678");
  await field(page, "증빙 서류").setInputFiles({
    name: "대표자확인서.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 대표자 확인서"),
  });
  await registerForm(page).getByRole("checkbox", { name: AGREEMENT, exact: true }).check();
}

test.describe("교회 등록 신청 입력 검사", () => {
  test("대표자 이름과 직분은 현재 사용자 값으로 미리 채워져 있다", async ({ page }) => {
    await page.goto("/admin?tab=register");
    await expect(field(page, "대표자 이름")).toHaveValue("김은혜");
    await expect(field(page, "직분")).toHaveValue("집사");
  });

  test("빈 채로 내면 필수 칸마다 오류를 보여 주고, 요약을 알리고, 첫 오류 칸으로 포커스를 옮긴다", async ({ page }) => {
    await page.goto("/admin?tab=register");
    await registerForm(page).getByRole("button", { name: "신청하기", exact: true }).click();

    await expect(registerForm(page).getByRole("alert")).toHaveText("입력을 확인해 주세요 (7개)");
    for (const [label, message] of [
      ["교회 이름", "교회 이름을 입력해 주세요."],
      ["담임목사", "담임목사 이름을 입력해 주세요."],
      ["지역", "지역을 골라 주세요."],
      ["주소", "주소를 입력해 주세요."],
      ["연락처", "연락처를 입력해 주세요."],
      ["증빙 서류", "증빙 서류를 첨부해 주세요."],
    ]) {
      await expect(field(page, label), label).toHaveAttribute("aria-invalid", "true");
      await expect(field(page, label), label).toHaveAccessibleDescription(new RegExp(message));
    }
    const agreement = registerForm(page).getByRole("checkbox", { name: AGREEMENT, exact: true });
    await expect(agreement).toHaveAttribute("aria-invalid", "true");
    await expect(registerForm(page).getByText("입력한 내용이 사실임을 확인해 주세요.")).toBeVisible();
    // 미리 채운 칸과 선택 칸은 오류가 아니다
    for (const label of ["대표자 이름", "직분", "교인 수 (선택)", "한 줄 소개 (선택)"]) {
      await expect(field(page, label), label).not.toHaveAttribute("aria-invalid", "true");
    }
    await expect(field(page, "교회 이름")).toBeFocused();
  });

  test("연락처와 증빙 서류의 꼴이 틀리면 그 칸만 막는다", async ({ page }) => {
    await page.goto("/admin?tab=register");
    await fillValidRegistration(page);
    await field(page, "연락처").fill("02-123-4567");
    await field(page, "증빙 서류").setInputFiles({
      name: "확인서.exe",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("MZ"),
    });
    await registerForm(page).getByRole("button", { name: "신청하기", exact: true }).click();

    await expect(registerForm(page).getByRole("alert")).toHaveText("입력을 확인해 주세요 (2개)");
    await expect(field(page, "연락처")).toHaveAccessibleDescription(/휴대전화 번호를 010-1234-5678 꼴로 입력해 주세요\./);
    await expect(field(page, "증빙 서류")).toHaveAccessibleDescription(/PDF, JPG, PNG 파일만 첨부할 수 있습니다\./);
    await expect(field(page, "교회 이름")).not.toHaveAttribute("aria-invalid", "true");
    await expect(field(page, "연락처")).toBeFocused();
  });

  test("고친 칸은 다시 내면 오류가 사라진다", async ({ page }) => {
    await page.goto("/admin?tab=register");
    const submit = registerForm(page).getByRole("button", { name: "신청하기", exact: true });
    await submit.click();
    await expect(registerForm(page).getByRole("alert")).toHaveText("입력을 확인해 주세요 (7개)");

    await field(page, "교회 이름").fill("소망교회");
    await submit.click();
    await expect(registerForm(page).getByRole("alert")).toHaveText("입력을 확인해 주세요 (6개)");
    await expect(field(page, "교회 이름")).not.toHaveAttribute("aria-invalid", "true");
    await expect(field(page, "담임목사")).toBeFocused();
  });
});

test.describe("교회 등록 신청 접수", () => {
  test("올바르게 내면 접수 화면으로 바뀌고, 저장되지 않는다는 안내와 입력 요약을 보여 준다", async ({ page }) => {
    await page.goto("/admin?tab=register");
    await fillValidRegistration(page);
    await registerForm(page).getByRole("button", { name: "신청하기", exact: true }).click();

    const done = page.getByRole("heading", { level: 3, name: "신청이 접수되었습니다", exact: true });
    await expect(done).toBeFocused();
    await expect(registerForm(page)).toHaveCount(0);
    const receipt = page.getByRole("region", { name: "신청이 접수되었습니다", exact: true });
    await expect(receipt).toContainText("데모 화면이라 저장되지 않습니다");
    for (const [term, value] of [
      ["교회 이름", "소망교회"],
      ["지역", "경기"],
      ["대표자", "김은혜 집사"],
      ["증빙 서류", "대표자확인서.pdf"],
    ]) {
      await expect(receipt.getByRole("term").filter({ hasText: term }), term).toHaveCount(1);
      await expect(receipt.getByRole("definition").filter({ hasText: value }), value).toHaveCount(1);
    }
  });

  test("'새로 작성'을 누르면 빈 폼으로 돌아가고 대표자 이름과 직분만 채워져 있다", async ({ page }) => {
    await page.goto("/admin?tab=register");
    await fillValidRegistration(page);
    await registerForm(page).getByRole("button", { name: "신청하기", exact: true }).click();
    await page.getByRole("button", { name: "새로 작성", exact: true }).click();

    await expect(field(page, "교회 이름")).toHaveValue("");
    await expect(field(page, "교회 이름")).toBeFocused();
    await expect(field(page, "지역")).toHaveValue("");
    await expect(field(page, "대표자 이름")).toHaveValue("김은혜");
    await expect(field(page, "직분")).toHaveValue("집사");
    await expect(registerForm(page).getByRole("checkbox", { name: AGREEMENT, exact: true })).not.toBeChecked();
    await expect(registerForm(page).getByRole("alert")).toHaveCount(0);
  });
});
