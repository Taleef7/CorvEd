import { test, expect } from "@playwright/test";

test.describe("Policies Page", () => {
  test("renders all policy sections", async ({ page }) => {
    await page.goto("/policies");
    await expect(
      page.getByRole("heading", { name: /reschedule/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /no.show/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /payment|refund|expiry/i }),
    ).toBeVisible();
  });

  test("has heading", async ({ page }) => {
    await page.goto("/policies");
    await expect(page.locator("h1")).toContainText(/policies/i);
  });
});
