import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const marketingPages = [
  { name: "home", path: "/" },
  { name: "about", path: "/about" },
  { name: "pricing", path: "/pricing" },
  { name: "blog", path: "/blog" },
  { name: "privacy", path: "/privacy" },
  { name: "terms", path: "/terms" },
  { name: "contact", path: "/contact" },
  { name: "faq", path: "/faq" },
];

const authPages = [
  { name: "login", path: "/login" },
  { name: "register", path: "/register" },
];

test.describe("Accessibility - Marketing Pages", () => {
  for (const { name, path } of marketingPages) {
    test(`${name} page passes axe WCAG 2.1 AA audit`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test.describe("Accessibility - Auth Pages", () => {
  for (const { name, path } of authPages) {
    test(`${name} page passes axe WCAG 2.1 AA audit`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test.describe("Accessibility - Semantic Structure", () => {
  test("home page has proper heading hierarchy", async ({ page }) => {
    await page.goto("/");
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });

  test("pages have proper landmark roles", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator('footer[role="contentinfo"]')).toBeVisible();
  });

  test("navigation has aria-label", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('nav[aria-label="Main navigation"]')).toBeVisible();
    await expect(page.locator('footer[aria-label="Site footer"]')).toBeVisible();
  });

  test("contact form inputs have labels", async ({ page }) => {
    await page.goto("/contact");
    const inputs = ["contact-name", "contact-email", "contact-subject", "contact-message"];
    for (const id of inputs) {
      await expect(page.locator(`label[for="${id}"]`)).toBeVisible();
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });
});
