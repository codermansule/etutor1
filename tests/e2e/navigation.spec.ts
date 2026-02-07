import { test, expect } from "@playwright/test";

test.describe("Header Navigation", () => {
  test("header has all expected nav links", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav.locator('a[href="/about"]')).toBeVisible();
    await expect(nav.locator('a[href="/how-it-works"]')).toBeVisible();
    await expect(nav.locator('a[href="/pricing"]')).toBeVisible();
    await expect(nav.locator('a[href="/subjects"]')).toBeVisible();
    await expect(nav.locator('a[href="/tutors"]')).toBeVisible();
    await expect(nav.locator('a[href="/blog"]')).toBeVisible();
  });

  test("header links navigate correctly", async ({ page }) => {
    await page.goto("/");

    await page.click('nav[aria-label="Main navigation"] >> text=About');
    await expect(page).toHaveURL(/\/about/);

    await page.click('nav[aria-label="Main navigation"] >> text=Pricing');
    await expect(page).toHaveURL(/\/pricing/);

    await page.click('nav[aria-label="Main navigation"] >> text=Blog');
    await expect(page).toHaveURL(/\/blog/);
  });

  test("header has login and signup buttons", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");
    await expect(header.locator('a[href="/login"]')).toBeVisible();
    await expect(header.locator('a[href="/register"]')).toBeVisible();
  });
});

test.describe("Footer", () => {
  test("footer is visible on marketing pages", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('footer[role="contentinfo"]')).toBeVisible();
  });

  test("footer has 4-column layout with correct sections", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator('footer[role="contentinfo"]');

    // Logo column
    await expect(footer.locator("text=Empowering learners worldwide")).toBeVisible();
    await expect(footer.locator("text=ETUTOR. All rights reserved")).toBeVisible();

    // Platform column
    await expect(footer.locator("text=Platform")).toBeVisible();
    await expect(footer.locator('a[href="/subjects"]')).toBeVisible();
    await expect(footer.locator('a[href="/tutors"]')).toBeVisible();
    await expect(footer.locator('a[href="/pricing"]')).toBeVisible();
    await expect(footer.locator('a[href="/blog"]')).toBeVisible();

    // Company column
    await expect(footer.locator("text=Company")).toBeVisible();
    await expect(footer.locator('a[href="/about"]')).toBeVisible();
    await expect(footer.locator('a[href="/how-it-works"]')).toBeVisible();
    await expect(footer.locator('a[href="/contact"]')).toBeVisible();
    await expect(footer.locator('a[href="/faq"]')).toBeVisible();

    // Legal column
    await expect(footer.locator("text=Legal")).toBeVisible();
    await expect(footer.locator('a[href="/privacy"]')).toBeVisible();
    await expect(footer.locator('a[href="/terms"]')).toBeVisible();
  });

  test("footer links navigate to correct pages", async ({ page }) => {
    await page.goto("/");

    await page.locator('footer[role="contentinfo"] a[href="/privacy"]').click();
    await expect(page).toHaveURL(/\/privacy/);
    await expect(page.locator("h1")).toContainText("Privacy Policy");

    await page.goto("/");
    await page.locator('footer[role="contentinfo"] a[href="/faq"]').click();
    await expect(page).toHaveURL(/\/faq/);
    await expect(page.locator("h1")).toContainText("Frequently Asked Questions");
  });
});

test.describe("404 Page", () => {
  test("nonexistent page shows 404", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist-12345");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  });
});
