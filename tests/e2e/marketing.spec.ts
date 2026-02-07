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

  test("home page has no Phase references", async ({ page }) => {
    await page.goto("/");
    const body = await page.locator("body").textContent();
    expect(body).not.toMatch(/Phase \d/i);
  });

  test("home page has CTA section with register and browse tutors links", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Start your learning journey today")).toBeVisible();
    await expect(page.locator('a[href="/register"]').first()).toBeVisible();
    await expect(page.locator('a[href="/tutors"]').first()).toBeVisible();
  });

  test("about page loads", async ({ page }) => {
    const response = await page.goto("/about");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText(/about|education/i);
  });

  test("about page has Our Mission section instead of roadmap", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("text=Our Mission")).toBeVisible();
    await expect(page.locator("text=Accessible Education")).toBeVisible();
    await expect(page.locator("text=Expert-Led Learning")).toBeVisible();
    await expect(page.locator("text=Technology That Helps")).toBeVisible();
    const body = await page.locator("body").textContent();
    expect(body).not.toMatch(/Development roadmap/i);
    expect(body).not.toMatch(/Phase \d/i);
  });

  test("pricing page loads with plan cards", async ({ page }) => {
    const response = await page.goto("/pricing");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    const planCards = page.locator('[class*="rounded-3xl"]').filter({ has: page.locator('text=/\\$/') });
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

  test("how it works page loads", async ({ page }) => {
    const response = await page.goto("/how-it-works");
    expect(response?.status()).toBe(200);
  });
});

test.describe("New Pages", () => {
  test("privacy page loads with correct heading", async ({ page }) => {
    const response = await page.goto("/privacy");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText("Privacy Policy");
  });

  test("privacy page has all required sections", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("text=Information We Collect")).toBeVisible();
    await expect(page.locator("text=How We Use Your Information")).toBeVisible();
    await expect(page.locator("text=Third-Party Services")).toBeVisible();
    await expect(page.locator("text=Data Retention")).toBeVisible();
    await expect(page.locator("text=Your Rights")).toBeVisible();
    await expect(page.locator("text=support@etutor.studybitests.com").first()).toBeVisible();
  });

  test("terms page loads with correct heading", async ({ page }) => {
    const response = await page.goto("/terms");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText("Terms of Service");
  });

  test("terms page has all required sections", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.locator("text=Account Registration")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Student.*Tutor Responsibilities/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Payment.*Refund/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Intellectual Property" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Limitation of Liability" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Termination" })).toBeVisible();
  });

  test("contact page loads with form and cards", async ({ page }) => {
    const response = await page.goto("/contact");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText("Get in touch");
    await expect(page.locator("text=General Inquiries")).toBeVisible();
    await expect(page.locator("text=Technical Support")).toBeVisible();
    await expect(page.locator("text=Tutor Applications")).toBeVisible();
    // Contact form fields
    await expect(page.locator("#contact-name")).toBeVisible();
    await expect(page.locator("#contact-email")).toBeVisible();
    await expect(page.locator("#contact-subject")).toBeVisible();
    await expect(page.locator("#contact-message")).toBeVisible();
    await expect(page.locator("button:has-text('Send message')")).toBeVisible();
  });

  test("FAQ page loads with sections and questions", async ({ page }) => {
    const response = await page.goto("/faq");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText("Frequently Asked Questions");
    await expect(page.getByRole("heading", { name: "General" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tutoring" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "AI Features" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Payments" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Account" })).toBeVisible();
  });

  test("FAQ page has JSON-LD structured data", async ({ page }) => {
    await page.goto("/faq");
    const jsonLdElements = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdElements.count();
    let hasFaqSchema = false;
    for (let i = 0; i < count; i++) {
      const content = await jsonLdElements.nth(i).textContent();
      if (content && content.includes("FAQPage")) {
        hasFaqSchema = true;
        const parsed = JSON.parse(content);
        expect(parsed["@type"]).toBe("FAQPage");
        expect(parsed.mainEntity.length).toBeGreaterThanOrEqual(15);
        break;
      }
    }
    expect(hasFaqSchema).toBe(true);
  });

  test("FAQ questions expand on click", async ({ page }) => {
    await page.goto("/faq");
    const firstQuestion = page.locator("details").first();
    const answer = firstQuestion.locator("p");
    await expect(answer).not.toBeVisible();
    await firstQuestion.locator("summary").click();
    await expect(answer).toBeVisible();
  });

  test("FAQ page links to contact page", async ({ page }) => {
    await page.goto("/faq");
    const contactLink = page.locator('a[href="/contact"]').first();
    await expect(contactLink).toBeVisible();
  });
});

test.describe("Contact Form", () => {
  test("contact form validates required fields", async ({ page }) => {
    await page.goto("/contact");
    const submitBtn = page.locator("button[type='submit']:has-text('Send message')");
    await expect(submitBtn).toBeVisible();
    // HTML required validation prevents empty submission — verify fields have required attribute
    await expect(page.locator("#contact-name")).toHaveAttribute("required", "");
    await expect(page.locator("#contact-email")).toHaveAttribute("required", "");
    await expect(page.locator("#contact-subject")).toHaveAttribute("required", "");
    await expect(page.locator("#contact-message")).toHaveAttribute("required", "");
  });

  test("contact form can be filled out", async ({ page }) => {
    await page.goto("/contact");
    await page.fill("#contact-name", "Test User");
    await page.fill("#contact-email", "test@example.com");
    await page.fill("#contact-subject", "Test Subject");
    await page.fill("#contact-message", "This is a test message for the contact form.");
    await expect(page.locator("#contact-name")).toHaveValue("Test User");
    await expect(page.locator("#contact-email")).toHaveValue("test@example.com");
    await expect(page.locator("#contact-subject")).toHaveValue("Test Subject");
  });
});
