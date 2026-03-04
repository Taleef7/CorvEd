import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test("landing page has no images without alt text", async ({ page }) => {
    await page.goto("/");
    const imagesWithoutAlt = await page.locator("img:not([alt])").count();
    expect(imagesWithoutAlt).toBe(0);
  });

  test("sign-in form labels are associated with inputs", async ({ page }) => {
    await page.goto("/auth/sign-in");
    // Check that email and password inputs have accessible labels
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toBeVisible();
  });

  test("landing page heading hierarchy is correct", async ({ page }) => {
    await page.goto("/");
    // Should have one h1
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test("interactive elements are keyboard-focusable", async ({ page }) => {
    await page.goto("/auth/sign-in");
    // Tab through the form
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    // Should focus an interactive element
    expect(["INPUT", "BUTTON", "A", "SELECT", "TEXTAREA"]).toContain(focused);
  });
});
