import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("renders hero section and CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText(/tutoring/i);
    // CTA buttons should link to sign-up and lead form
    await expect(
      page.getByRole("link", { name: /get started|sign up/i }).first(),
    ).toBeVisible();
  });

  test("has pricing section with correct tiers", async ({ page }) => {
    await page.goto("/");
    // Should display the 3 package tiers (number + "sessions/month" in separate spans)
    await expect(page.getByText(/8\s*sessions/i).first()).toBeVisible();
    await expect(page.getByText(/12\s*sessions/i).first()).toBeVisible();
    await expect(page.getByText(/20\s*sessions/i).first()).toBeVisible();
  });

  test("no admin link visible on public nav", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav");
    await expect(nav.getByText(/admin/i)).not.toBeVisible();
  });

  test("footer links are accessible", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: /policies/i }).first(),
    ).toBeVisible();
  });
});
