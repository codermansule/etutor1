import { test, expect } from "@playwright/test";

test.describe("Authentication Pages", () => {
  test("login page renders form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
  });

  test("register page renders form", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("form")).toBeVisible();
  });

  test("unauthenticated student route redirects to login", async ({ page }) => {
    await page.goto("/student");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("unauthenticated tutor route redirects to login", async ({ page }) => {
    await page.goto("/tutor");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });
});
