import { test, expect } from "@playwright/test";

test.describe("Protected Routes (unauthenticated)", () => {
  test("dashboard redirects to sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/auth\/sign-in/);
  });

  test("tutor page redirects to sign-in", async ({ page }) => {
    await page.goto("/tutor");
    await expect(page).toHaveURL(/auth\/sign-in/);
  });

  test("admin page redirects to sign-in", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/auth\/sign-in/);
  });

  test("new request page redirects to sign-in", async ({ page }) => {
    await page.goto("/dashboard/requests/new");
    await expect(page).toHaveURL(/auth\/sign-in/);
  });
});
