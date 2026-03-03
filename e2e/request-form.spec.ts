import { test, expect } from "@playwright/test";

test.describe("New Tutoring Request Form", () => {
  // Since this is a protected route, unauthenticated users get redirected
  test("redirects unauthenticated users to sign-in", async ({ page }) => {
    await page.goto("/dashboard/requests/new");
    await expect(page).toHaveURL(/auth\/sign-in/);
  });
});

test.describe("Admin Subjects Page", () => {
  test("redirects unauthenticated users to sign-in", async ({ page }) => {
    await page.goto("/admin/subjects");
    await expect(page).toHaveURL(/auth\/sign-in/);
  });
});

test.describe("Admin Dashboard", () => {
  test("redirects unauthenticated users to sign-in", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/auth\/sign-in/);
  });
});
