import { test, expect } from "@playwright/test";

test("immersive phone, progressive cracking and reset", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("main")).toHaveClass(/immersive/);
  await expect(page.getByText("RUST / WASM")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("heading", { name: /Think/ })).toBeVisible();
  await expect(page.getByText("정상", { exact: true })).toBeVisible();
  await page.screenshot({ path: "test-results/" + test.info().project.name + "-home-v2.png", fullPage: true });

  await page.getByRole("button", { name: "화면 크랙" }).click();
  await expect(page.getByText("접힘 자국")).toBeVisible();
  await page.getByRole("button", { name: "⌁ 균열 강화" }).click();
  await expect(page.getByText("미세 균열")).toBeVisible();
  await page.getByRole("button", { name: "⌁ 균열 강화" }).click();
  await expect(page.getByText("패널 손상")).toBeVisible();
  await page.screenshot({ path: "test-results/" + test.info().project.name + "-crack-v2.png", fullPage: true });

  await page.getByRole("button", { name: "↺ 초기화" }).click();
  await expect(page.getByText("정상", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "앱 최적화 오류" }).click();
  await expect(page.getByText(/최적화되지 않은 앱/)).toBeVisible();

  await page.getByRole("button", { name: "⇤ 접기" }).click();
  await expect(page.getByText("화면이 접혔습니다")).toBeVisible();
  await page.getByRole("button", { name: "⇥ 펼치기" }).click();
  await expect(page.getByText("접힘 자국")).toBeVisible();
});

test("mobile viewport uses full-screen display", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".virtual-display")).toBeVisible();
  await expect(page.locator(".phone")).toHaveCount(0);
  const bounds = await page.locator(".virtual-display").boundingBox();
  expect(bounds?.width).toBe(390);
  expect(bounds?.height).toBe(844);
});
