import { test, expect } from "@playwright/test";

test.describe("Blog", () => {
  test("blog index page loads with heading", async ({ page }) => {
    const response = await page.goto("/blog");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText("Insights");
  });

  test("blog index shows 6 posts", async ({ page }) => {
    await page.goto("/blog");
    const articles = page.locator("article");
    await expect(articles).toHaveCount(6);
  });

  test("blog posts have title, excerpt, date, and tags", async ({ page }) => {
    await page.goto("/blog");
    const firstArticle = page.locator("article").first();
    await expect(firstArticle.locator("h2")).toBeVisible();
    await expect(firstArticle.locator("time")).toBeVisible();
    const tags = firstArticle.locator('[class*="bg-sky-500"]');
    expect(await tags.count()).toBeGreaterThanOrEqual(1);
  });

  test("blog post page loads with full content", async ({ page }) => {
    await page.goto("/blog/getting-started-with-etutor", { waitUntil: "networkidle" });
    // MDX renders a second h1 inside .prose — use first() for the page header
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("time")).toBeVisible();
    await expect(page.locator(".prose")).toBeVisible();
  });

  test.describe("Individual blog posts load correctly", () => {
    const slugs = [
      "getting-started-with-etutor",
      "how-ai-tutoring-works",
      "5-tips-for-effective-online-tutoring",
      "why-gamification-works-in-education",
      "choosing-the-right-tutor",
      "ai-study-plans-explained",
    ];

    for (const slug of slugs) {
      test(`/blog/${slug} renders`, async ({ page }) => {
        await page.goto(`/blog/${slug}`, { waitUntil: "networkidle", timeout: 15000 });
        await expect(page.locator("h1").first()).toBeVisible();
        await expect(page.locator(".prose")).toBeVisible();
      });
    }
  });

  test("blog post has BlogPosting JSON-LD", async ({ page }) => {
    await page.goto("/blog/getting-started-with-etutor", { waitUntil: "networkidle" });
    const jsonLdElements = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdElements.count();
    let hasBlogSchema = false;
    for (let i = 0; i < count; i++) {
      const content = await jsonLdElements.nth(i).textContent();
      if (content && content.includes("BlogPosting")) {
        hasBlogSchema = true;
        const parsed = JSON.parse(content);
        expect(parsed["@type"]).toBe("BlogPosting");
        expect(parsed.headline).toBeTruthy();
        expect(parsed.datePublished).toBeTruthy();
        break;
      }
    }
    expect(hasBlogSchema).toBe(true);
  });

  test("nonexistent blog post returns 404", async ({ page }) => {
    const response = await page.goto("/blog/this-post-does-not-exist");
    expect(response?.status()).toBe(404);
  });
});
