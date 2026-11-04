import { test, expect } from "@playwright/test";

test("fold, experience scenarios, report and reset", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /기대했던 미래/ })).toBeVisible();
  await expect(page.getByText("Rust / WASM 엔진")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByLabel("접힌 가상 기기")).toBeVisible();

  await page.getByRole("button", { name: "↔ 펼치기" }).click();
  await expect(page.getByLabel("펼쳐진 가상 기기")).toBeVisible();

  await page.getByRole("button", { name: "분할 화면 실행" }).click();
  await expect(page.getByText("오늘 할 일")).toBeVisible();

  await page.getByRole("button", { name: /수리 상담 시뮬레이션/ }).click();
  await page.getByRole("button", { name: "가상 상담 시작" }).click();
  await expect(page.getByText("SUPPORT CHAT · PARODY")).toBeVisible();

  await page.getByRole("button", { name: /디스플레이 테스트/ }).click();
  await page.getByRole("button", { name: "가상 화면 이상 재현" }).click();
  await expect(page.getByLabel("가상 디스플레이 이상 효과")).toBeVisible();

  await page.getByRole("button", { name: /내 체험 보고서 확인/ }).click();
  await expect(page.getByText("완료한 시나리오")).toBeVisible();
  await expect(page.getByText("3 / 3")).toBeVisible();

  await page.getByRole("button", { name: "초기화" }).click();
  await expect(page.getByLabel("접힌 가상 기기")).toBeVisible();
  await expect(page.getByText("펼치기 0회")).toBeVisible();
});
