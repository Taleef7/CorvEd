import { test, expect } from "@playwright/test";

test.describe("Not Found Page", () => {
  test("shows 404 for unknown routes", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: /not found/i }),
    ).toBeVisible();
  });
});
