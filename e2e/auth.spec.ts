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

  test("sign-up parent tab shows parent-specific fields and CTA", async ({ page }) => {
    await page.goto("/auth/sign-up");
    await page.getByRole("button", { name: "Parent" }).click();

    await expect(page.getByLabel(/child's full name/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create Parent Account", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign up with google/i }),
    ).toBeVisible();
  });

  test("sign-up tutor tab routes applicants to the tutor application", async ({
    page,
  }) => {
    await page.goto("/auth/sign-up");
    await page.getByRole("button", { name: "Tutor" }).click();

    await expect(
      page.getByRole("link", { name: /go to tutor application/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign up with google/i }),
    ).toHaveCount(0);
  });

  test("verify page includes resend verification controls", async ({ page }) => {
    await page.goto("/auth/verify");
    await expect(page.getByText("Didn't receive it?")).toBeVisible();
    await expect(page.getByPlaceholder(/re-enter your email/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Resend", exact: true }),
    ).toBeVisible();
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
