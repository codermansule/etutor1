import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/student/", "/tutor/", "/admin/", "/api/", "/classroom/"],
      },
    ],
    sitemap: "https://etutor.studybitests.com/sitemap.xml",
  };
}
