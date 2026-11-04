import { test, expect } from "@playwright/test";

test("duo visual presets, crack overlay, fold, and Rust/WASM", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /펼치는 순간/ })).toBeVisible();
  await expect(page.getByText("RUST / WEBASSEMBLY")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("device")).toHaveClass(/unfolded/);
  await page.screenshot({ path: "test-results/" + test.info().project.name + "-duo-default.png", fullPage: true });
  await page.getByRole("button", { name: /화면 비율 미지원/ }).click();
  await expect(page.getByText("UNUSED SPACE").first()).toBeVisible();
  await page.getByRole("button", { name: /반쪽 화면만 사용/ }).click();
  await expect(page.getByText("NO SECOND PANE")).toBeVisible();
  await page.getByRole("button", { name: /접힘선 UI 충돌/ }).click();
  await expect(page.getByText("중앙에 걸친 확인 버튼")).toBeVisible();
  await page.getByRole("button", { name: /가운데 크랙 발생/ }).click();
  await expect(page.getByTestId("crack-effect")).toBeVisible();
  await page.screenshot({ path: "test-results/" + test.info().project.name + "-duo-crack.png", fullPage: true });
  await page.getByRole("checkbox", { name: "크랙 효과 표시" }).uncheck();
  await expect(page.getByTestId("crack-effect")).toHaveCount(0);
  await page.getByRole("button", { name: "접기" }).click();
  await expect(page.getByTestId("device")).toHaveClass(/folded/);
  await page.getByRole("button", { name: "펼치기" }).click();
  await expect(page.getByTestId("device")).toHaveClass(/unfolded/);
  await page.getByRole("button", { name: "초기화" }).click();
  await expect(page.getByTestId("device")).toHaveClass(/unfolded/);
  await expect(page.getByRole("button", { name: /정상 최적화/ })).toHaveAttribute("aria-pressed", "true");
});
