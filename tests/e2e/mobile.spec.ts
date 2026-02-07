import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 375, height: 812 } });

test.describe("Mobile Navigation", () => {
  test("hamburger menu is visible on mobile", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByLabel("Open menu")).toBeVisible();
    // Desktop nav should be hidden
    await expect(page.locator('nav[aria-label="Main navigation"]')).not.toBeVisible();
  });

  test("hamburger menu opens and shows all nav links", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Open menu").click();
    const mobileNav = page.locator('nav[aria-label="Mobile navigation"]');
    await expect(mobileNav).toBeVisible();

    await expect(mobileNav.locator('a[href="/about"]')).toBeVisible();
    await expect(mobileNav.locator('a[href="/how-it-works"]')).toBeVisible();
    await expect(mobileNav.locator('a[href="/pricing"]')).toBeVisible();
    await expect(mobileNav.locator('a[href="/subjects"]')).toBeVisible();
    await expect(mobileNav.locator('a[href="/tutors"]')).toBeVisible();
    await expect(mobileNav.locator('a[href="/blog"]')).toBeVisible();
    await expect(mobileNav.locator('a[href="/login"]')).toBeVisible();
    await expect(mobileNav.locator('a[href="/register"]')).toBeVisible();
  });

  test("hamburger menu closes on link click", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Open menu").click();
    await page.locator('nav[aria-label="Mobile navigation"] a[href="/about"]').click();
    await expect(page).toHaveURL(/\/about/);
    await expect(page.locator('nav[aria-label="Mobile navigation"]')).not.toBeVisible();
  });

  test("hamburger menu closes with X button", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Open menu").click();
    await expect(page.locator('nav[aria-label="Mobile navigation"]')).toBeVisible();
    await page.getByLabel("Close menu").click();
    await expect(page.locator('nav[aria-label="Mobile navigation"]')).not.toBeVisible();
  });
});

test.describe("Mobile Page Rendering", () => {
  test("home page renders on mobile without horizontal scroll", async ({ page }) => {
    await page.goto("/");
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });

  test("privacy page renders on mobile", async ({ page }) => {
    const response = await page.goto("/privacy");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText("Privacy Policy");
  });

  test("terms page renders on mobile", async ({ page }) => {
    const response = await page.goto("/terms");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText("Terms of Service");
  });

  test("contact page renders on mobile with form visible", async ({ page }) => {
    const response = await page.goto("/contact");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText("Get in touch");
    await expect(page.locator("#contact-name")).toBeVisible();
    await expect(page.locator("#contact-email")).toBeVisible();
  });

  test("FAQ page renders on mobile with expandable questions", async ({ page }) => {
    const response = await page.goto("/faq");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText("Frequently Asked Questions");
    // Expand a question
    const firstQuestion = page.locator("details").first();
    await firstQuestion.locator("summary").click();
    await expect(firstQuestion.locator("p")).toBeVisible();
  });

  test("blog index loads on mobile", async ({ page }) => {
    const response = await page.goto("/blog");
    expect(response?.status()).toBe(200);
  });

  test("blog post loads on mobile", async ({ page }) => {
    const response = await page.goto("/blog/ai-study-plans-explained", {
      waitUntil: "networkidle",
      timeout: 15000,
    });
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("pricing page stacks cards on mobile", async ({ page }) => {
    const response = await page.goto("/pricing");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("login page renders on mobile", async ({ page }) => {
    const response = await page.goto("/login");
    expect(response?.status()).toBe(200);
  });

  test("register page renders on mobile", async ({ page }) => {
    const response = await page.goto("/register");
    expect(response?.status()).toBe(200);
  });
});
