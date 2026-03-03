import { test, expect } from "@playwright/test";

test.describe("Responsive — Mobile viewport", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("landing page is mobile-friendly", async ({ page }) => {
    await page.goto("/");
    // Hero heading should be visible and not overflow
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    const box = await h1.boundingBox();
    expect(box).not.toBeNull();
    // H1 should be within the viewport width
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(375 + 20); // allow small margin
  });

  test("sign-in form fits mobile screen", async ({ page }) => {
    await page.goto("/auth/sign-in");
    const form = page.locator("form");
    await expect(form).toBeVisible();
    const box = await form.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(375);
  });

  test("policies page scrolls without horizontal overflow", async ({
    page,
  }) => {
    await page.goto("/policies");
    // Check no horizontal scrollbar
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // allow tiny rounding
  });
});
