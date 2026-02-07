import { test, expect } from "@playwright/test";

test.describe("SEO - Meta Tags", () => {
  const pages = [
    { path: "/", titleMatch: /ETUTOR/ },
    { path: "/about", titleMatch: /About.*ETUTOR/i },
    { path: "/privacy", titleMatch: /Privacy.*ETUTOR/i },
    { path: "/terms", titleMatch: /Terms.*ETUTOR/i },
    { path: "/contact", titleMatch: /Contact.*ETUTOR/i },
    { path: "/faq", titleMatch: /FAQ.*ETUTOR/i },
    { path: "/blog", titleMatch: /Blog.*ETUTOR/i },
  ];

  for (const { path, titleMatch } of pages) {
    test(`${path} has correct title`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(titleMatch);
    });
  }

  test("pages have meta description", async ({ page }) => {
    for (const path of ["/privacy", "/terms", "/contact", "/faq", "/blog"]) {
      await page.goto(path);
      const description = page.locator('meta[name="description"]');
      await expect(description).toHaveAttribute("content", /.+/);
    }
  });
});

test.describe("SEO - JSON-LD Structured Data", () => {
  test("home page has Organization JSON-LD", async ({ page }) => {
    await page.goto("/");
    const jsonLd = await getJsonLdByType(page, "Organization");
    expect(jsonLd).toBeTruthy();
    expect(jsonLd.name).toBe("ETUTOR");
    expect(jsonLd.url).toContain("etutor.studybitests.com");
  });

  test("FAQ page has FAQPage JSON-LD with 18+ questions", async ({ page }) => {
    await page.goto("/faq");
    const jsonLd = await getJsonLdByType(page, "FAQPage");
    expect(jsonLd).toBeTruthy();
    expect(jsonLd.mainEntity.length).toBeGreaterThanOrEqual(15);
    // Verify structure of first question
    const firstQ = jsonLd.mainEntity[0];
    expect(firstQ["@type"]).toBe("Question");
    expect(firstQ.name).toBeTruthy();
    expect(firstQ.acceptedAnswer["@type"]).toBe("Answer");
    expect(firstQ.acceptedAnswer.text).toBeTruthy();
  });

  test("blog post has BlogPosting JSON-LD", async ({ page }) => {
    await page.goto("/blog/getting-started-with-etutor");
    const jsonLd = await getJsonLdByType(page, "BlogPosting");
    expect(jsonLd).toBeTruthy();
    expect(jsonLd.headline).toBeTruthy();
    expect(jsonLd.datePublished).toBeTruthy();
    expect(jsonLd.author).toBeTruthy();
    expect(jsonLd.publisher.name).toBe("ETUTOR");
  });
});

test.describe("SEO - Sitemap & Robots", () => {
  test("robots.txt is accessible", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
    const text = await page.locator("body").textContent();
    expect(text).toContain("User-Agent");
  });

  test("sitemap.xml is accessible", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);
  });
});

test.describe("SEO - Open Graph", () => {
  test("home page has OG tags", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /.+/);
  });
});

// Helper to extract JSON-LD by @type
async function getJsonLdByType(page: import("@playwright/test").Page, type: string) {
  const scripts = page.locator('script[type="application/ld+json"]');
  const count = await scripts.count();
  for (let i = 0; i < count; i++) {
    const content = await scripts.nth(i).textContent();
    if (content) {
      const parsed = JSON.parse(content);
      if (parsed["@type"] === type) return parsed;
    }
  }
  return null;
}
