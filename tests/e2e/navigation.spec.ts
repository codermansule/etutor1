import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("header links navigate correctly", async ({ page }) => {
    await page.goto("/");

    // Click About link
    await page.click('nav >> text=About');
    await expect(page).toHaveURL(/\/about/);

    // Click Pricing link
    await page.click('nav >> text=Pricing');
    await expect(page).toHaveURL(/\/pricing/);
  });

  test("footer is visible on marketing pages", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toBeVisible();
  });

  test("nonexistent page shows 404", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist-12345");
    expect(response?.status()).toBe(404);
    await expect(page.locator("text=/not found|404/i")).toBeVisible();
  });
});
