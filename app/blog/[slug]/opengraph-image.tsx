import { ImageResponse } from "next/og";
import { getPostBySlug, getAllPosts } from "@/lib/blog/utils";

export const alt = "ETUTOR Blog Post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const title = post?.frontmatter.title ?? "ETUTOR Blog";
  const author = post?.frontmatter.author ?? "ETUTOR Team";
  const date = post?.frontmatter.date
    ? new Date(post.frontmatter.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "60px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
              color: "#0f172a",
              fontSize: "24px",
              fontWeight: 800,
            }}
          >
            E
          </div>
          <span
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#e2e8f0",
              letterSpacing: "0.1em",
            }}
          >
            ETUTOR BLOG
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: "52px",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.2,
              maxWidth: "900px",
            }}
          >
            {title.length > 80 ? title.slice(0, 77) + "..." : title}
          </div>
        </div>

        {/* Bottom meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            color: "#94a3b8",
            fontSize: "18px",
          }}
        >
          <span style={{ fontWeight: 600 }}>{author}</span>
          {date && (
            <>
              <span style={{ color: "#475569" }}>|</span>
              <span>{date}</span>
            </>
          )}
          <span style={{ color: "#475569" }}>|</span>
          <span>etutor.studybitests.com</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
