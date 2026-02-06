import type { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { getAllPosts } from "@/lib/blog/utils";

const BASE_URL = "https://etutor.studybitests.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...[
      "/about",
      "/pricing",
      "/how-it-works",
      "/subjects",
      "/tutors",
      "/login",
      "/register",
    ].map((path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Blog posts
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = getAllPosts();
    blogRoutes = posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.frontmatter.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // Blog directory may not exist yet
  }

  // Dynamic subject routes
  let subjectRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createServerClient();
    const { data: subjects } = await supabase
      .from("subjects")
      .select("slug, name");

    if (subjects) {
      subjectRoutes = subjects
        .filter((s) => s.slug)
        .map((subject) => ({
          url: `${BASE_URL}/subjects/${subject.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        }));
    }
  } catch {
    // Supabase may not be available at build time
  }

  return [...staticRoutes, ...blogRoutes, ...subjectRoutes];
}
