import { test, expect } from "@playwright/test";

test.describe("Authentication Pages", () => {
  test("login page renders form with email and password fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
  });

  test("register page renders form", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("form")).toBeVisible();
  });

  test("login page has link to register", async ({ page }) => {
    await page.goto("/login");
    const registerLinks = page.locator('a[href="/register"]');
    expect(await registerLinks.count()).toBeGreaterThanOrEqual(1);
  });

  test("register page has link to login", async ({ page }) => {
    await page.goto("/register");
    const loginLinks = page.locator('a[href="/login"]');
    expect(await loginLinks.count()).toBeGreaterThanOrEqual(1);
  });

  test("password recovery page loads", async ({ page }) => {
    const response = await page.goto("/recover");
    expect(response?.status()).toBe(200);
  });
});

test.describe("Protected Routes", () => {
  test("unauthenticated student route redirects to login", async ({ page }) => {
    await page.goto("/student");
    await page.waitForURL(/\/login/, { timeout: 10000 });
    expect(page.url()).toContain("/login");
  });

  test("unauthenticated tutor route redirects to login", async ({ page }) => {
    await page.goto("/tutor");
    await page.waitForURL(/\/login/, { timeout: 10000 });
    expect(page.url()).toContain("/login");
  });

  test("unauthenticated admin route redirects to login", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL(/\/login/, { timeout: 10000 });
    expect(page.url()).toContain("/login");
  });

  test("unauthenticated AI tutor route redirects to login", async ({ page }) => {
    await page.goto("/student/ai-tutor");
    await page.waitForURL(/\/login/, { timeout: 10000 });
    expect(page.url()).toContain("/login");
  });

  test("unauthenticated achievements route redirects to login", async ({ page }) => {
    await page.goto("/student/achievements");
    await page.waitForURL(/\/login/, { timeout: 10000 });
    expect(page.url()).toContain("/login");
  });
});
