import { test, expect } from "@playwright/test";

test.describe("Auth Pages", () => {
  test("sign-in page renders form", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await expect(
      page.locator("p").filter({ hasText: "Don't have an account?" }),
    ).toBeVisible();
    await expect(page.locator("p").filter({ hasText: "Don;'t" })).toHaveCount(
      0,
    );
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign In", exact: true }),
    ).toBeVisible();
  });

  test("sign-in has Google OAuth button", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await expect(
      page.getByRole("button", { name: /google/i }),
    ).toBeVisible();
  });

  test("sign-up page renders form", async ({ page }) => {
    await page.goto("/auth/sign-up");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  });

  test("forgot-password page renders form", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /reset|send/i }),
    ).toBeVisible();
  });

  test("sign-in with invalid email shows error", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await page.getByLabel(/email/i).fill("bad@email");
    await page.getByLabel("Password").fill("short");
    await page.getByRole("button", { name: "Sign In", exact: true }).click();
    // Should stay on sign-in page (auth error or validation)
    await expect(page).toHaveURL(/sign-in/);
  });
});
