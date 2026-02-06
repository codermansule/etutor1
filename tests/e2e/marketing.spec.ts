import { test, expect } from "@playwright/test";

test.describe("Marketing Pages", () => {
  test("home page loads with correct title and h1", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ETUTOR/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("home page has JSON-LD structured data", async ({ page }) => {
    await page.goto("/");
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd.first()).toBeAttached();
  });

  test("about page loads", async ({ page }) => {
    const response = await page.goto("/about");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText(/about|education/i);
  });

  test("pricing page loads with plan cards", async ({ page }) => {
    const response = await page.goto("/pricing");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    // Should have 3 plan sections (Free, Basic, Premium)
    const plans = page.locator("text=Get started, text=Start Basic, text=Go Premium");
    // Use a simpler selector
    const planCards = page.locator('[class*="rounded-3xl"]').filter({ has: page.locator('text=/\\$/')});
    await expect(planCards).toHaveCount(3);
  });

  test("subjects page loads", async ({ page }) => {
    const response = await page.goto("/subjects");
    expect(response?.status()).toBe(200);
  });

  test("tutors page loads", async ({ page }) => {
    const response = await page.goto("/tutors");
    expect(response?.status()).toBe(200);
  });
});
