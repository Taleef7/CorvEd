import { test, expect } from "@playwright/test";

test.describe("Dashboard Protected Routes", () => {
  test("student dashboard redirects unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/auth\/sign-in/);
  });

  test("student request detail redirects unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/dashboard/requests/some-id");
    await expect(page).toHaveURL(/auth\/sign-in/);
  });

  test("package selection page redirects unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/dashboard/packages/new");
    await expect(page).toHaveURL(/auth\/sign-in/);
  });

  test("package selection with tier param redirects unauthenticated", async ({
    page,
  }) => {
    await page.goto("/dashboard/packages/new?tier=12");
    await expect(page).toHaveURL(/auth\/sign-in/);
  });

  test("package detail page redirects unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/dashboard/packages/some-id");
    await expect(page).toHaveURL(/auth\/sign-in/);
  });

  test("student sessions page redirects unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/dashboard/sessions");
    await expect(page).toHaveURL(/auth\/sign-in/);
  });
});

test.describe("Admin Protected Routes", () => {
  test("admin request detail redirects unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/admin/requests/some-id");
    await expect(page).toHaveURL(/auth\/sign-in/);
  });

  test("admin sessions page redirects unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/admin/sessions");
    await expect(page).toHaveURL(/auth\/sign-in/);
  });

  test("admin payments page redirects unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/admin/payments");
    await expect(page).toHaveURL(/auth\/sign-in/);
  });

  test("admin matches page redirects unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/admin/matches");
    await expect(page).toHaveURL(/auth\/sign-in/);
  });
});

test.describe("Tutor Protected Routes", () => {
  test("tutor dashboard redirects unauthenticated users", async ({ page }) => {
    await page.goto("/tutor");
    await expect(page).toHaveURL(/auth\/sign-in/);
  });

  test("tutor profile redirects unauthenticated users", async ({ page }) => {
    await page.goto("/tutor/profile");
    await expect(page).toHaveURL(/auth\/sign-in/);
  });

  test("tutor sessions redirects unauthenticated users", async ({ page }) => {
    await page.goto("/tutor/sessions");
    await expect(page).toHaveURL(/auth\/sign-in/);
  });

  test("tutor conduct page redirects unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/tutor/conduct");
    await expect(page).toHaveURL(/auth\/sign-in/);
  });
});
